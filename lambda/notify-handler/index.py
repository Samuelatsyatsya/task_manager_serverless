import json
import os
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.types import TypeDeserializer


dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
cognito = boto3.client('cognito-idp')

tasks_table = dynamodb.Table(os.environ['TASKS_TABLE'])
assignments_table = dynamodb.Table(os.environ['ASSIGNMENTS_TABLE'])
sns_topic_arn = os.environ['SNS_TOPIC_ARN']
user_pool_id = os.environ['COGNITO_USER_POOL_ID']
admin_email = os.environ.get('ADMIN_EMAIL')


deserializer = TypeDeserializer()


def _deserialize_image(image):
    return {k: deserializer.deserialize(v) for k, v in image.items()}


def _attrs_to_map(attrs):
    return {item['Name']: item['Value'] for item in attrs}


def _get_user_by_sub(user_sub):
    result = cognito.list_users(
        UserPoolId=user_pool_id,
        Filter=f'sub = "{user_sub}"',
        Limit=1,
    )
    users = result.get('Users', [])
    return users[0] if users else None


def _is_active_user(user_sub):
    user = _get_user_by_sub(user_sub)
    if not user or not user.get('Enabled'):
        return False

    attrs = _attrs_to_map(user.get('Attributes', []))
    return attrs.get('email_verified') == 'true'


def _resolve_user_email(user_sub):
    user = _get_user_by_sub(user_sub)
    if not user or not user.get('Enabled'):
        return None

    attrs = _attrs_to_map(user.get('Attributes', []))
    if attrs.get('email_verified') != 'true':
        return None
    return attrs.get('email')


def _get_admin_emails():
    emails = set()
    if admin_email:
        emails.add(admin_email)

    token = None
    while True:
        params = {'UserPoolId': user_pool_id, 'Limit': 60}
        if token:
            params['PaginationToken'] = token

        page = cognito.list_users(**params)
        for user in page.get('Users', []):
            if not user.get('Enabled'):
                continue
            attrs = _attrs_to_map(user.get('Attributes', []))
            role = attrs.get('custom:role', 'member')
            if role != 'admin' or attrs.get('email_verified') != 'true':
                continue
            email = attrs.get('email')
            if email:
                emails.add(email)

        token = page.get('PaginationToken')
        if not token:
            break

    return emails


def _publish_notification(recipients, subject, message, notification_type, task_id):
    recipients = sorted({email for email in recipients if email})
    if not recipients:
        print(f'Skipping publish for {notification_type} on task {task_id}: no recipients')
        return

    payload = {
        'type': notification_type,
        'taskId': task_id,
        'subject': subject,
        'message': message,
        'recipients': recipients,
        'publishedAt': datetime.utcnow().isoformat(),
    }

    sns.publish(
        TopicArn=sns_topic_arn,
        Subject=subject,
        Message=json.dumps(payload),
    )
    print(f'Published {notification_type} for task {task_id} to {len(recipients)} recipient(s)')


def _handle_assignment_insert(record):
    new_image = _deserialize_image(record['dynamodb'].get('NewImage', {}))
    task_id = new_image.get('taskId')
    target_user_id = new_image.get('userId')
    target_email = new_image.get('userEmail')

    if not task_id or not target_user_id:
        print(f'Skipping assignment notification: missing taskId/userId. NewImage={new_image}')
        return

    if not target_email:
        target_email = _resolve_user_email(target_user_id)

    if not target_email:
        print(f'Skipping assignment notification for task {task_id}: no verified email for userId={target_user_id}')
        return

    task_item = tasks_table.get_item(Key={'taskId': task_id}).get('Item', {})
    title = task_item.get('title', 'Task')
    description = task_item.get('description', '')
    priority = task_item.get('priority', 'N/A')
    status = task_item.get('status', 'open')

    message = (
        'You have been assigned a new task\n\n'
        f'Task: {title}\n'
        f'Description: {description}\n'
        f'Priority: {priority}\n'
        f'Status: {status}\n\n'
        'Please log in to the task management system to view details.'
    )

    _publish_notification(
        recipients=[target_email],
        subject=f'New Task Assignment: {title}',
        message=message,
        notification_type='task_assigned',
        task_id=task_id,
    )


def _handle_task_status_change(record):
    old_image = _deserialize_image(record['dynamodb'].get('OldImage', {}))
    new_image = _deserialize_image(record['dynamodb'].get('NewImage', {}))

    old_status = old_image.get('status')
    new_status = new_image.get('status')
    if not old_status or not new_status or old_status == new_status:
        print(f'Skipping task MODIFY event: status unchanged or missing ({old_status} -> {new_status})')
        return

    task_id = new_image.get('taskId')
    if not task_id:
        print('Skipping task status notification: missing taskId')
        return

    actor_email = new_image.get('updatedByEmail') or new_image.get('closedByEmail')

    assignment_rows = assignments_table.query(
        IndexName='TaskIdIndex',
        KeyConditionExpression=Key('taskId').eq(task_id),
    ).get('Items', [])

    recipients = set(_get_admin_emails())

    for assignment in assignment_rows:
        user_id = assignment.get('userId')
        user_email = assignment.get('userEmail')

        if not user_email:
            continue

        # Prefer resilient delivery using the persisted assignment email.
        # If user exists and is verified/enabled, keep that path too.
        if user_id and _is_active_user(user_id):
            recipients.add(user_email)
            continue

        if user_id:
            resolved_email = _resolve_user_email(user_id)
            if resolved_email:
                recipients.add(resolved_email)
                continue

        recipients.add(user_email)

    if actor_email in recipients:
        recipients.remove(actor_email)

    title = new_image.get('title', 'Task')
    description = new_image.get('description', '')

    message = (
        'Task Status Updated\n\n'
        f'Task: {title}\n'
        f'Previous Status: {old_status}\n'
        f'New Status: {new_status}\n'
        f'Updated By: {actor_email or "Unknown"}\n'
        f'Updated At: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")} UTC\n\n'
        f'Description: {description}'
    )

    _publish_notification(
        recipients=recipients,
        subject=f'Task Status Updated: {title}',
        message=message,
        notification_type='task_status_changed',
        task_id=task_id,
    )


def handler(event, context):
    try:
        records = event.get('Records', [])
        print(f'notify-handler invoked with {len(records)} record(s)')

        for idx, record in enumerate(records, start=1):
            if record.get('eventSource') != 'aws:dynamodb':
                print(f'Record {idx}: skipping non-dynamodb source {record.get("eventSource")}')
                continue

            event_name = record.get('eventName')
            source_arn = record.get('eventSourceARN', '')
            print(f'Record {idx}: eventName={event_name}, sourceArn={source_arn}')
            dynamodb_record = record.get('dynamodb', {})
            new_image = _deserialize_image(dynamodb_record.get('NewImage', {})) if dynamodb_record.get('NewImage') else {}
            old_image = _deserialize_image(dynamodb_record.get('OldImage', {})) if dynamodb_record.get('OldImage') else {}

            # Primary route: use source ARN when available.
            # DynamoDB stream ARNs are shaped as:
            # arn:aws:dynamodb:<region>:<account>:table/<table-name>/stream/<timestamp>
            table_name_from_arn = None
            if ':table/' in source_arn:
                table_name_from_arn = source_arn.split(':table/', 1)[1].split('/stream/', 1)[0]

            if table_name_from_arn:
                if table_name_from_arn == assignments_table.name and event_name == 'INSERT':
                    print(f'Record {idx}: processing assignment INSERT event (source ARN match)')
                    _handle_assignment_insert(record)
                    continue

                if table_name_from_arn == tasks_table.name and event_name == 'MODIFY':
                    print(f'Record {idx}: processing task MODIFY event (source ARN match)')
                    _handle_task_status_change(record)
                    continue

            # Fallback route: infer from record payload shape.
            if event_name == 'INSERT' and new_image.get('assignmentId') and new_image.get('taskId') and new_image.get('userId'):
                print(f'Record {idx}: processing assignment INSERT event (payload match)')
                _handle_assignment_insert(record)
                continue

            if event_name == 'MODIFY' and old_image.get('status') is not None and new_image.get('status') is not None:
                print(f'Record {idx}: processing task MODIFY event (payload match)')
                _handle_task_status_change(record)
                continue

            print(f'Record {idx}: no notification rule matched. event={event_name} newKeys={list(new_image.keys())}')

        return {'statusCode': 200, 'body': 'ok'}

    except Exception as exc:
        print(f'Error handling notification stream: {exc}')
        raise

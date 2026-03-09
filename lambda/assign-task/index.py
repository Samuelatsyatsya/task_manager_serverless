import json
import os
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError


dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')
tasks_table = dynamodb.Table(os.environ['TASKS_TABLE'])
assignments_table = dynamodb.Table(os.environ['ASSIGNMENTS_TABLE'])
user_pool_id = os.environ['COGNITO_USER_POOL_ID']


def _is_admin(claims):
    user_role = claims.get('custom:role', 'member')
    cognito_groups = claims.get('cognito:groups', [])
    if isinstance(cognito_groups, str):
        cognito_groups = [cognito_groups]
    return user_role == 'admin' or 'admin' in cognito_groups


def _response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Content-Type': 'application/json',
        },
        'body': json.dumps(body, default=str),
    }


def _attributes_to_map(attributes):
    return {item['Name']: item['Value'] for item in attributes}


def _get_user_by_sub(user_sub):
    response = cognito.list_users(
        UserPoolId=user_pool_id,
        Filter=f'sub = "{user_sub}"',
        Limit=1,
    )
    users = response.get('Users', [])
    if not users:
        return None
    return users[0]


def _is_assignable_member(cognito_user):
    if not cognito_user or not cognito_user.get('Enabled'):
        return False, None, None

    attrs = _attributes_to_map(cognito_user.get('Attributes', []))
    email = attrs.get('email')
    email_verified = attrs.get('email_verified') == 'true'
    role = attrs.get('custom:role', 'member')

    if not email or not email_verified:
        return False, None, role

    if role == 'admin':
        return False, email, role

    return True, email, role


def handler(event, context):
    try:
        claims = event['requestContext']['authorizer']['claims']
        admin_user_id = claims['sub']
        admin_email = claims.get('email')

        if not _is_admin(claims):
            return _response(403, {
                'error': 'Forbidden',
                'message': 'Only admins can assign tasks',
            })

        task_id = event['pathParameters']['taskId']
        body = json.loads(event.get('body') or '{}')
        target_user_id = body.get('userId')

        if not target_user_id:
            return _response(400, {
                'error': 'Bad Request',
                'message': 'Missing required field: userId',
            })

        task_response = tasks_table.get_item(Key={'taskId': task_id})
        task = task_response.get('Item')
        if not task:
            return _response(404, {
                'error': 'Not Found',
                'message': 'Task not found',
            })

        if task.get('status') == 'closed':
            return _response(400, {
                'error': 'Bad Request',
                'message': 'Cannot assign a closed task',
            })

        existing_assignment = assignments_table.query(
            IndexName='UserIdIndex',
            KeyConditionExpression=Key('userId').eq(target_user_id) & Key('taskId').eq(task_id),
        )
        if existing_assignment.get('Items'):
            return _response(409, {
                'error': 'Conflict',
                'message': 'Task already assigned to this user',
            })

        target_user = _get_user_by_sub(target_user_id)
        is_assignable, target_email, target_role = _is_assignable_member(target_user)
        if not is_assignable:
            return _response(400, {
                'error': 'Bad Request',
                'message': 'Cannot assign task to this user. User may be inactive, unverified, deleted, or not a member.',
                'role': target_role,
            })

        now = int(datetime.utcnow().timestamp())
        assignment_id = f'{task_id}#{target_user_id}'
        assignment = {
            'assignmentId': assignment_id,
            'taskId': task_id,
            'userId': target_user_id,
            'userEmail': target_email,
            'assignedBy': admin_user_id,
            'assignedByEmail': admin_email,
            'assignedAt': now,
        }
        try:
            assignments_table.put_item(
                Item=assignment,
                ConditionExpression='attribute_not_exists(assignmentId)',
            )
        except ClientError as exc:
            if exc.response.get('Error', {}).get('Code') == 'ConditionalCheckFailedException':
                return _response(409, {
                    'error': 'Conflict',
                    'message': 'Task already assigned to this user',
                })
            raise

        return _response(201, {
            'message': 'Task assigned successfully',
            'assignment': assignment,
        })

    except Exception as exc:
        print(f'Error assigning task: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

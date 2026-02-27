import json
import os
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource('dynamodb')
tasks_table = dynamodb.Table(os.environ['TASKS_TABLE'])
assignments_table = dynamodb.Table(os.environ['ASSIGNMENTS_TABLE'])


ALLOWED_STATUSES = {'open', 'in-progress', 'closed'}


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


def handler(event, context):
    try:
        claims = event['requestContext']['authorizer']['claims']
        user_id = claims['sub']
        user_email = claims.get('email')
        is_admin = _is_admin(claims)

        task_id = event['pathParameters']['taskId']
        body = json.loads(event.get('body') or '{}')
        new_status = body.get('status')

        if new_status not in ALLOWED_STATUSES:
            return _response(400, {
                'error': 'Bad Request',
                'message': 'Status must be one of: open, in-progress, closed',
            })

        task_result = tasks_table.get_item(Key={'taskId': task_id})
        if 'Item' not in task_result:
            return _response(404, {
                'error': 'Not Found',
                'message': 'Task not found',
            })

        current_task = task_result['Item']

        if not is_admin:
            if new_status == 'closed':
                return _response(403, {
                    'error': 'Forbidden',
                    'message': 'Members cannot close tasks',
                })

            assignment_result = assignments_table.query(
                IndexName='UserIdIndex',
                KeyConditionExpression=Key('userId').eq(user_id) & Key('taskId').eq(task_id),
            )
            if not assignment_result.get('Items'):
                return _response(403, {
                    'error': 'Forbidden',
                    'message': 'You can only update status for tasks assigned to you',
                })

        if current_task.get('status') == new_status:
            return _response(200, {
                'message': 'Task status unchanged',
                'task': current_task,
            })

        now = int(datetime.utcnow().timestamp())
        result = tasks_table.update_item(
            Key={'taskId': task_id},
            UpdateExpression='SET #status = :status, updatedAt = :updatedAt, updatedBy = :updatedBy, updatedByEmail = :updatedByEmail',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': new_status,
                ':updatedAt': now,
                ':updatedBy': user_id,
                ':updatedByEmail': user_email,
            },
            ReturnValues='ALL_NEW',
        )

        return _response(200, {
            'message': 'Task status updated successfully',
            'task': result['Attributes'],
        })

    except Exception as exc:
        print(f'Error updating task status: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

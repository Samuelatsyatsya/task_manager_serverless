import json
import os
from datetime import datetime

import boto3


dynamodb = boto3.resource('dynamodb')
tasks_table = dynamodb.Table(os.environ['TASKS_TABLE'])


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

        if not _is_admin(claims):
            return _response(403, {
                'error': 'Forbidden',
                'message': 'Only admins can close tasks',
            })

        task_id = event['pathParameters']['taskId']
        existing = tasks_table.get_item(Key={'taskId': task_id})
        task = existing.get('Item')
        if not task:
            return _response(404, {
                'error': 'Not Found',
                'message': 'Task not found',
            })

        if task.get('status') == 'closed':
            return _response(400, {
                'error': 'Bad Request',
                'message': 'Task is already closed',
            })

        now = int(datetime.utcnow().timestamp())
        result = tasks_table.update_item(
            Key={'taskId': task_id},
            UpdateExpression='SET #status = :status, updatedAt = :updatedAt, closedBy = :closedBy, closedByEmail = :closedByEmail, closedAt = :closedAt',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'closed',
                ':updatedAt': now,
                ':closedBy': user_id,
                ':closedByEmail': user_email,
                ':closedAt': now,
            },
            ReturnValues='ALL_NEW',
        )

        return _response(200, {
            'message': 'Task closed successfully',
            'task': result['Attributes'],
        })

    except Exception as exc:
        print(f'Error closing task: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

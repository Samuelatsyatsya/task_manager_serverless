import json
import os
from datetime import datetime

import boto3


dynamodb = boto3.resource('dynamodb')
tasks_table = dynamodb.Table(os.environ['TASKS_TABLE'])


ALLOWED_FIELDS = {'title', 'description', 'priority', 'dueDate', 'tags'}


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
        if not _is_admin(claims):
            return _response(403, {
                'error': 'Forbidden',
                'message': 'Only admins can update task details',
            })

        task_id = event['pathParameters']['taskId']
        body = json.loads(event.get('body') or '{}')

        if not body:
            return _response(400, {
                'error': 'Bad Request',
                'message': 'No fields provided for update',
            })

        invalid_fields = [field for field in body.keys() if field not in ALLOWED_FIELDS]
        if invalid_fields:
            return _response(400, {
                'error': 'Bad Request',
                'message': f'Unsupported fields: {", ".join(invalid_fields)}. Use /status endpoint for status updates.',
            })

        existing = tasks_table.get_item(Key={'taskId': task_id})
        if 'Item' not in existing:
            return _response(404, {
                'error': 'Not Found',
                'message': 'Task not found',
            })

        update_expression = 'SET updatedAt = :updatedAt'
        values = {':updatedAt': int(datetime.utcnow().timestamp())}

        for field in ALLOWED_FIELDS:
            if field in body:
                update_expression += f', {field} = :{field}'
                values[f':{field}'] = body[field]

        result = tasks_table.update_item(
            Key={'taskId': task_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=values,
            ReturnValues='ALL_NEW',
        )

        return _response(200, {
            'message': 'Task updated successfully',
            'task': result['Attributes'],
        })

    except Exception as exc:
        print(f'Error updating task: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

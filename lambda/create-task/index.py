import json
import os
import uuid
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
        user_email = claims['email']

        if not _is_admin(claims):
            return _response(403, {
                'error': 'Forbidden',
                'message': 'Only admins can create tasks',
            })

        body = json.loads(event.get('body') or '{}')

        for field in ['title', 'description', 'priority']:
            if field not in body:
                return _response(400, {
                    'error': 'Bad Request',
                    'message': f'Missing required field: {field}',
                })

        now = int(datetime.utcnow().timestamp())
        task = {
            'taskId': str(uuid.uuid4()),
            'title': body['title'],
            'description': body['description'],
            'priority': body['priority'],
            'status': 'open',
            'createdBy': user_id,
            'createdByEmail': user_email,
            'createdAt': now,
            'updatedAt': now,
            'dueDate': body.get('dueDate'),
            'tags': body.get('tags', []),
        }

        tasks_table.put_item(Item=task)

        return _response(201, {
            'message': 'Task created successfully',
            'task': task,
        })

    except Exception as exc:
        print(f'Error creating task: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

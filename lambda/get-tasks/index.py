import json
import os

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource('dynamodb')
tasks_table = dynamodb.Table(os.environ['TASKS_TABLE'])
assignments_table = dynamodb.Table(os.environ['ASSIGNMENTS_TABLE'])


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
        is_admin = _is_admin(claims)

        query_params = event.get('queryStringParameters') or {}
        status_filter = query_params.get('status')

        if is_admin:
            if status_filter:
                response = tasks_table.query(
                    IndexName='StatusIndex',
                    KeyConditionExpression=Key('status').eq(status_filter),
                )
            else:
                response = tasks_table.scan()

            tasks = response.get('Items', [])
        else:
            assignments_response = assignments_table.query(
                IndexName='UserIdIndex',
                KeyConditionExpression=Key('userId').eq(user_id),
            )

            tasks = []
            for assignment in assignments_response.get('Items', []):
                task_id = assignment.get('taskId')
                if not task_id:
                    continue

                task_response = tasks_table.get_item(Key={'taskId': task_id})
                task = task_response.get('Item')
                if not task:
                    continue

                if status_filter and task.get('status') != status_filter:
                    continue

                tasks.append(task)

        tasks.sort(key=lambda item: item.get('createdAt', 0), reverse=True)

        return _response(200, {
            'tasks': tasks,
            'count': len(tasks),
        })

    except Exception as exc:
        print(f'Error getting tasks: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

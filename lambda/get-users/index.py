import json
import os

import boto3


cognito = boto3.client('cognito-idp')
user_pool_id = os.environ['COGNITO_USER_POOL_ID']


def _is_admin(claims):
    user_role = claims.get('custom:role', 'member')
    cognito_groups = claims.get('cognito:groups', [])
    if isinstance(cognito_groups, str):
        cognito_groups = [cognito_groups]
    return user_role == 'admin' or 'admin' in cognito_groups


def _attrs_to_map(attrs):
    return {item['Name']: item['Value'] for item in attrs}


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
                'message': 'Only admins can list assignable members',
            })

        users = []
        pagination_token = None

        while True:
            params = {'UserPoolId': user_pool_id, 'Limit': 60}
            if pagination_token:
                params['PaginationToken'] = pagination_token

            page = cognito.list_users(**params)
            for user in page.get('Users', []):
                attrs = _attrs_to_map(user.get('Attributes', []))
                role = attrs.get('custom:role', 'member')
                enabled = user.get('Enabled', False)
                email_verified = attrs.get('email_verified') == 'true'

                if not enabled or not email_verified or role == 'admin':
                    continue

                users.append({
                    'userId': attrs.get('sub'),
                    'email': attrs.get('email'),
                    'firstName': attrs.get('given_name', ''),
                    'lastName': attrs.get('family_name', ''),
                    'role': role,
                    'status': 'active',
                })

            pagination_token = page.get('PaginationToken')
            if not pagination_token:
                break

        return _response(200, {'users': users})

    except Exception as exc:
        print(f'Error listing users: {exc}')
        return _response(500, {
            'error': 'Internal Server Error',
            'message': str(exc),
        })

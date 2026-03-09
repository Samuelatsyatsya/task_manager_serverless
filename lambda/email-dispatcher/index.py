import json
import os

import boto3


ses = boto3.client('ses')
notification_from_email = os.environ['NOTIFICATION_FROM_EMAIL']


def _send_email_batch(recipients, subject, message):
    # SES supports up to 50 recipients per call.
    for i in range(0, len(recipients), 50):
        chunk = recipients[i:i + 50]
        ses.send_email(
            Source=notification_from_email,
            Destination={'ToAddresses': chunk},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': message}},
            },
        )
        print(f'Sent SES email for subject "{subject}" to batch of {len(chunk)} recipient(s)')


def handler(event, context):
    for record in event.get('Records', []):
        payload = record.get('Sns', {}).get('Message', '{}')

        try:
            message = json.loads(payload)
        except json.JSONDecodeError:
            print(f'Ignoring non-JSON SNS payload: {payload}')
            continue

        recipients = sorted({email for email in message.get('recipients', []) if email})
        subject = message.get('subject', 'Task Notification')
        body = message.get('message', '')

        if not recipients or not body:
            print(f'Skipping SNS message: recipients={len(recipients)} body_present={bool(body)}')
            continue

        _send_email_batch(recipients, subject, body)

    return {'statusCode': 200, 'body': 'emails_sent'}

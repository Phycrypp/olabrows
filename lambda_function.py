import json
import boto3
import csv
import io
import os
from datetime import datetime
import urllib.parse

s3 = boto3.client('s3')
ses = boto3.client('ses', region_name=os.environ.get('SES_REGION', 'us-east-1'))

BUCKET_NAME = os.environ['BUCKET_NAME']
CSV_KEY = os.environ.get('CSV_KEY', 'subscribers.csv')
NOTIFY_EMAIL = os.environ['NOTIFY_EMAIL']
FROM_EMAIL = os.environ['FROM_EMAIL']

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        first_name = body.get('firstName', '').strip()
        email = body.get('email', '').strip().lower()

        if not email or '@' not in email:
            return {
                'statusCode': 400, 'headers': headers,
                'body': json.dumps({'success': False, 'message': 'Valid email required'})
            }

        # Read existing CSV
        try:
            obj = s3.get_object(Bucket=BUCKET_NAME, Key=CSV_KEY)
            existing = obj['Body'].read().decode('utf-8')
        except s3.exceptions.NoSuchKey:
            existing = 'First Name,Email,Date,Source\n'

        # Check for duplicates
        if email in existing:
            return {
                'statusCode': 200, 'headers': headers,
                'body': json.dumps({'success': True, 'message': "You're already on the list!"})
            }

        # Append new subscriber
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        new_row = f'{first_name},{email},{timestamp},website\n'
        updated_csv = existing + new_row

        # Save to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=CSV_KEY,
            Body=updated_csv.encode('utf-8'),
            ContentType='text/csv'
        )

        # Send notification email to you
        ses.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [NOTIFY_EMAIL]},
            Message={
                'Subject': {'Data': f'New Subscriber — {first_name or email}'},
                'Body': {'Html': {'Data': f"""
                <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:2rem;color:#1a0f0f">
                  <h2 style="font-size:1.5rem;font-weight:400;margin-bottom:1rem;color:#8b4a4a">New Early Access Subscriber 🌸</h2>
                  <p><b>Name:</b> {first_name or 'Not provided'}</p>
                  <p><b>Email:</b> {email}</p>
                  <p><b>Date:</b> {timestamp} UTC</p>
                  <p style="margin-top:1.5rem;font-size:.85rem;color:#999">Browed by Olá — Early Access List</p>
                </div>"""}}
            }
        )

        # Send welcome email to subscriber
        ses.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': "You're on the list — Browed by Olá 🌸"},
                'Body': {'Html': {'Data': f"""
                <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:3rem 2rem;color:#1a0f0f;background:#fff9f7">
                  <h1 style="font-size:2rem;font-weight:400;color:#1a0f0f;margin-bottom:.5rem">Welcome{', ' + first_name if first_name else ''} 🌸</h1>
                  <p style="color:#8b4a4a;font-style:italic;margin-bottom:2rem">You're officially on the Browed by Olá early access list.</p>
                  <p style="line-height:1.8;color:#555;margin-bottom:1rem">Thank you for joining us. You'll be among the very first to shop the Precision Brow Collection — and you'll get <b>15% off your first order</b> when we launch.</p>
                  <p style="line-height:1.8;color:#555;margin-bottom:2rem">In the meantime, follow us on Instagram for behind-the-scenes content and shade reveals.</p>
                  <a href="https://instagram.com/Olaoluwa_0" style="display:inline-block;background:#1a0f0f;color:white;padding:.85rem 2rem;text-decoration:none;font-size:.78rem;letter-spacing:.15em;text-transform:uppercase;font-weight:500">Follow @Olaoluwa_0</a>
                  <p style="margin-top:3rem;font-size:.8rem;color:#ccc">You received this because you signed up at olabrows.store. <a href="#" style="color:#c49090">Unsubscribe</a></p>
                </div>"""}}
            }
        )

        return {
            'statusCode': 200, 'headers': headers,
            'body': json.dumps({'success': True, 'message': "You're on the list! Check your email."})
        }

    except Exception as e:
        print(f'Error: {str(e)}')
        return {
            'statusCode': 500, 'headers': headers,
            'body': json.dumps({'success': False, 'message': 'Something went wrong. Please try again.'})
        }

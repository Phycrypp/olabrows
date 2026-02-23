# Browed by Olá — Subscriber Database Setup Guide

## What this does
When someone fills in the Early Access form on your website:
1. Their name + email gets saved to a CSV file in S3
2. You get an email notification instantly
3. They receive a beautiful welcome email with their 15% discount reminder

---

## Step 1 — Verify your email in SES

1. Go to **AWS Console → SES (Simple Email Service)**
2. Click **"Verified identities" → "Create identity"**
3. Choose **"Email address"**, enter your email (e.g. hello@olabrows.store or your Gmail)
4. Click the verification link AWS sends you
5. Repeat for a FROM email if different

---

## Step 2 — Create the Lambda function

1. Go to **AWS Console → Lambda → "Create function"**
2. Choose **"Author from scratch"**
3. Name: `ola-subscriber`
4. Runtime: **Python 3.12**
5. Click **"Create function"**
6. In the code editor, **delete all existing code** and paste the contents of `lambda_function.py`
7. Click **"Deploy"**

---

## Step 3 — Set environment variables

In your Lambda function, click **"Configuration" → "Environment variables" → "Edit"**

Add these 4 variables:

| Key | Value |
|-----|-------|
| `BUCKET_NAME` | `www.olabrows.store` |
| `CSV_KEY` | `subscribers.csv` |
| `NOTIFY_EMAIL` | your-email@gmail.com |
| `FROM_EMAIL` | your-verified-ses-email@gmail.com |

Click **"Save"**

---

## Step 4 — Give Lambda permission to use S3 and SES

1. In your Lambda function → **"Configuration" → "Permissions"**
2. Click the **role name** (opens IAM)
3. Click **"Add permissions" → "Attach policies"**
4. Search and attach these two policies:
   - `AmazonS3FullAccess`
   - `AmazonSESFullAccess`
5. Click **"Add permissions"**

---

## Step 5 — Create API Gateway

1. Go to **AWS Console → API Gateway → "Create API"**
2. Choose **"HTTP API" → "Build"**
3. Click **"Add integration" → Lambda**
4. Select your `ola-subscriber` function
5. API name: `ola-subscribe-api`
6. Click **"Next"**
7. Configure routes:
   - Method: **POST**
   - Resource path: `/subscribe`
   - Integration target: your Lambda
8. Click through to **"Create"**
9. Copy your **Invoke URL** — looks like:
   `https://abc123.execute-api.us-east-1.amazonaws.com`

---

## Step 6 — Add your API URL to the website

Open `index.html` and find this line:

```javascript
const API_URL = 'YOUR_API_GATEWAY_URL';
```

Replace with your actual URL:

```javascript
const API_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com/subscribe';
```

Upload the updated `index.html` to S3.

---

## Step 7 — Test it!

1. Visit your website
2. Fill in the Early Access form
3. You should get a notification email immediately
4. The subscriber should get a welcome email
5. Check S3 for a new `subscribers.csv` file

---

## Viewing your subscribers

1. Go to **S3 → your bucket**
2. Find `subscribers.csv`
3. Click **"Download"**
4. Open in Excel or Google Sheets

The CSV has columns: `First Name, Email, Date, Source`

---

## Estimated Cost

At your current scale: **$0/month**
- Lambda: 1 million free requests/month
- S3: minimal storage cost
- SES: 62,000 free emails/month

---

## Need help?

If you get stuck on any step, share a screenshot and we can troubleshoot together!

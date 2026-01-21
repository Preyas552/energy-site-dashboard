# AWS Lambda Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
1. AWS Account (free tier eligible)
2. AWS CLI installed and configured
3. Python 3.11+

### Step 1: Install AWS CLI

**Windows:**
```cmd
# Download from: https://aws.amazon.com/cli/
# Or use chocolatey:
choco install awscli
```

**Mac:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID: (from AWS Console → IAM → Users → Security credentials)
- AWS Secret Access Key: (from same place)
- Default region: `us-east-1` (or your preferred region)
- Default output format: `json`

### Step 3: Deploy to Lambda

**Linux/Mac:**
```bash
cd topsis-service
chmod +x deploy-lambda.sh
./deploy-lambda.sh
```

**Windows:**
```cmd
cd topsis-service
deploy-lambda.bat
```

### Step 4: Get Your Function URL

The script will output your Lambda Function URL:
```
https://abc123xyz.lambda-url.us-east-1.on.aws/
```

### Step 5: Update Frontend

Update your `energy-site-selector/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-function-url.lambda-url.us-east-1.on.aws
```

### Step 6: Test

```bash
# Test health endpoint
curl https://your-function-url.lambda-url.us-east-1.on.aws/health

# Should return:
# {"status":"healthy","service":"fuzzy-topsis"}
```

## Alternative: Manual Deployment via AWS Console

### 1. Create Lambda Function

1. Go to AWS Console → Lambda
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `topsis-service`
5. Runtime: Python 3.11
6. Click "Create function"

### 2. Upload Code

```bash
# Package your code
cd topsis-service
pip install -r requirements.txt -t lambda-package/
cp app.py lambda-package/
cp lambda_handler.py lambda-package/
cd lambda-package
zip -r ../lambda-deployment.zip .
```

1. In Lambda console, click "Upload from" → ".zip file"
2. Upload `lambda-deployment.zip`
3. Set Handler to: `lambda_handler.lambda_handler`
4. Set Memory to: 1024 MB
5. Set Timeout to: 30 seconds

### 3. Create Function URL

1. In Lambda console, go to "Configuration" → "Function URL"
2. Click "Create function URL"
3. Auth type: NONE
4. Configure CORS:
   - Allow origin: `*`
   - Allow methods: `*`
   - Allow headers: `*`
5. Click "Save"
6. Copy the Function URL

### 4. Test

Click "Test" tab → Create test event:
```json
{
  "rawPath": "/health",
  "requestContext": {
    "http": {
      "method": "GET"
    }
  }
}
```

## Cost Estimate

For 100 users (500 requests/month):
- **$0.00/month** (within free tier)

For 1,000 users (5,000 requests/month):
- **$0.00/month** (within free tier)

For 10,000 users (50,000 requests/month):
- **$0.01/month**

## Troubleshooting

### Error: "Unable to import module 'lambda_handler'"
- Make sure `lambda_handler.py` is in the root of your ZIP
- Handler should be: `lambda_handler.lambda_handler`

### Error: "Task timed out after 3.00 seconds"
- Increase timeout in Configuration → General configuration → Timeout
- Set to 30 seconds

### Error: "Memory limit exceeded"
- Increase memory in Configuration → General configuration → Memory
- Set to 1024 MB (numpy needs this)

### Cold Start Issues
- First request takes 2-5 seconds (normal)
- Subsequent requests are fast (< 100ms)
- To reduce: Use provisioned concurrency (costs extra)

## Monitoring

View logs in AWS CloudWatch:
1. Lambda console → Monitor → View logs in CloudWatch
2. See request count, duration, errors

## Updating Your Function

After making code changes:

**Linux/Mac:**
```bash
./deploy-lambda.sh
```

**Windows:**
```cmd
deploy-lambda.bat
```

## Deleting the Function

```bash
aws lambda delete-function --function-name topsis-service --region us-east-1
aws iam detach-role-policy --role-name topsis-service-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name topsis-service-role
```

## Next Steps

1. Deploy frontend to Vercel
2. Update frontend API URL
3. Test end-to-end
4. Monitor usage in AWS Console

## Support

- AWS Lambda Docs: https://docs.aws.amazon.com/lambda/
- AWS Free Tier: https://aws.amazon.com/free/
- Pricing Calculator: https://calculator.aws/

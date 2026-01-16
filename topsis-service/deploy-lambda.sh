#!/bin/bash

# AWS Lambda Deployment Script for TOPSIS Service
# This script packages and deploys your Flask app to AWS Lambda

set -e

echo "🚀 Deploying TOPSIS Service to AWS Lambda..."

# Configuration
FUNCTION_NAME="python-topsis"  # Your existing function name
REGION="us-east-1"
RUNTIME="python3.12"  # Match your existing runtime
HANDLER="lambda_handler.lambda_handler"
MEMORY_SIZE=1024
TIMEOUT=30

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Creating deployment package...${NC}"

# Create a clean deployment directory
rm -rf lambda-package
mkdir -p lambda-package

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -t lambda-package/

# Copy application files
echo "Copying application files..."
cp app.py lambda-package/
cp lambda_handler.py lambda-package/

# Create ZIP file
echo "Creating ZIP package..."
cd lambda-package
zip -r ../lambda-deployment.zip . -q
cd ..

echo -e "${GREEN}✓ Package created: lambda-deployment.zip${NC}"

# Check if function exists
echo -e "${YELLOW}Step 2: Checking if Lambda function exists...${NC}"

if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
    echo "Function exists. Updating code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
    
    echo "Updating configuration..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --memory-size $MEMORY_SIZE \
        --timeout $TIMEOUT \
        --region $REGION
else
    echo "Function doesn't exist. Creating new function..."
    
    # You need to create an IAM role first
    echo -e "${YELLOW}Creating IAM role...${NC}"
    
    # Create trust policy
    cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create role
    ROLE_ARN=$(aws iam create-role \
        --role-name ${FUNCTION_NAME}-role \
        --assume-role-policy-document file://trust-policy.json \
        --query 'Role.Arn' \
        --output text 2>/dev/null || \
        aws iam get-role --role-name ${FUNCTION_NAME}-role --query 'Role.Arn' --output text)
    
    # Attach basic execution policy
    aws iam attach-role-policy \
        --role-name ${FUNCTION_NAME}-role \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    echo "Waiting for role to be ready..."
    sleep 10
    
    # Create function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://lambda-deployment.zip \
        --memory-size $MEMORY_SIZE \
        --timeout $TIMEOUT \
        --region $REGION
fi

echo -e "${YELLOW}Step 3: Creating Function URL...${NC}"

# Create or get function URL
FUNCTION_URL=$(aws lambda create-function-url-config \
    --function-name $FUNCTION_NAME \
    --auth-type NONE \
    --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=*" \
    --region $REGION \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || \
    aws lambda get-function-url-config \
    --function-name $FUNCTION_NAME \
    --region $REGION \
    --query 'FunctionUrl' \
    --output text)

# Add permission for public access
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE \
    --region $REGION 2>/dev/null || echo "Permission already exists"

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Your Lambda Function URL:${NC}"
echo -e "${YELLOW}$FUNCTION_URL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test your function:"
echo "curl ${FUNCTION_URL}health"
echo ""
echo "Update your frontend .env file:"
echo "NEXT_PUBLIC_API_URL=${FUNCTION_URL}"
echo ""

# Cleanup
rm -rf lambda-package trust-policy.json

echo -e "${GREEN}Done! 🎉${NC}"

@echo off
REM AWS Lambda Deployment Script for TOPSIS Service (Windows)

echo Deploying TOPSIS Service to AWS Lambda...

REM Configuration
set FUNCTION_NAME=topsis-service
set REGION=us-east-1
set RUNTIME=python3.11
set HANDLER=lambda_handler.lambda_handler
set MEMORY_SIZE=1024
set TIMEOUT=30

echo Step 1: Creating deployment package...

REM Create a clean deployment directory
if exist lambda-package rmdir /s /q lambda-package
mkdir lambda-package

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt -t lambda-package/

REM Copy application files
echo Copying application files...
copy app.py lambda-package\
copy lambda_handler.py lambda-package\

REM Create ZIP file (requires PowerShell)
echo Creating ZIP package...
powershell Compress-Archive -Path lambda-package\* -DestinationPath lambda-deployment.zip -Force

echo Package created: lambda-deployment.zip

echo Step 2: Deploying to AWS Lambda...
echo.
echo Please run these AWS CLI commands manually:
echo.
echo 1. Create/Update function:
echo    aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://lambda-deployment.zip --region %REGION%
echo.
echo 2. Create Function URL:
echo    aws lambda create-function-url-config --function-name %FUNCTION_NAME% --auth-type NONE --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=*" --region %REGION%
echo.
echo 3. Add public access permission:
echo    aws lambda add-permission --function-name %FUNCTION_NAME% --statement-id FunctionURLAllowPublicAccess --action lambda:InvokeFunctionUrl --principal "*" --function-url-auth-type NONE --region %REGION%
echo.

pause

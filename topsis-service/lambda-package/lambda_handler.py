"""
AWS Lambda handler for TOPSIS service
Wraps the Flask app to work with Lambda
"""
import json
from app import app

def lambda_handler(event, context):
    """
    AWS Lambda handler function
    Converts API Gateway event to Flask request and back
    """
    # Debug logging
    print(f"Event: {json.dumps(event)}")
    
    # Handle different event formats
    if 'requestContext' in event and 'http' in event.get('requestContext', {}):
        # Lambda Function URL format (v2)
        http_method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
        path = event.get('rawPath', '/')
        # Normalize path (remove double slashes)
        while path.startswith('//'):
            path = path[1:]
        headers = event.get('headers', {})
        body = event.get('body', '')
        query_params = event.get('queryStringParameters', {})
    elif 'httpMethod' in event:
        # API Gateway REST API format (v1)
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        # Normalize path (remove double slashes)
        while path.startswith('//'):
            path = path[1:]
        headers = event.get('headers', {})
        body = event.get('body', '')
        query_params = event.get('queryStringParameters', {})
    else:
        # Fallback
        http_method = 'GET'
        path = '/'
        headers = {}
        body = ''
        query_params = {}
    
    print(f"Extracted - Method: {http_method}, Path: {path}")
    
    # Parse body if it's a string
    if isinstance(body, str) and body:
        try:
            body = json.loads(body)
        except:
            pass
    
    # Create a test request context for Flask
    with app.test_request_context(
        path=path,
        method=http_method,
        headers=headers,
        query_string=query_params,
        data=json.dumps(body) if body else None,
        content_type='application/json'
    ):
        try:
            # Process the request through Flask
            response = app.full_dispatch_request()
            
            # Get response data
            response_data = response.get_data(as_text=True)
            
            # Return Lambda-compatible response
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                'body': response_data
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': str(e)
                })
            }

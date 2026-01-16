"""
Simple Lambda handler for testing - no dependencies
Use this to verify Lambda is working before adding Flask
"""
import json

def lambda_handler(event, context):
    """
    Simple test handler
    """
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Lambda is working!',
            'event': event
        })
    }

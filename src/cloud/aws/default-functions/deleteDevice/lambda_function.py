import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    client = boto3.client('dynamodb')
    
    device = event['device']
    uuid = device['uuid']
    
    globalStatus = dynamodb.Table('globalStatus')
    
    try:
        response = globalStatus.delete_item(
            Key={
                'uuid': uuid
            }
        )
    except:
        print('Closing lambda function')
        return {
            'statusCode': 400,
            'body': json.dumps('Error deleting device')
        }
    else:
        return response

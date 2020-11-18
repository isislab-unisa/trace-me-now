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
    except ClientError as e:
        if e.response['Error']['Code'] == "ConditionalCheckFailedException":
            print(e.response['Error']['Message'])
        else:
            raise
    else:
        return response

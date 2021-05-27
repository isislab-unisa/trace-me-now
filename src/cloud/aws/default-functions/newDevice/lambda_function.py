import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    client = boto3.client('dynamodb')
    mqtt = boto3.client('iot-data', region_name='us-east-1')
    
    globalStatus = dynamodb.Table('globalStatus')
    
    device = event['device']
  
    try:
        globalStatus.put_item(Item={
            'uuid': device['uuid'],
            'lastSeen': device['lastSeen'],
            'lastPosition': device['lastPosition'],
            'roomNumber': device['roomNumber'],
            'trackingNodeId': device['trackingNodeId']
            }
        )
    except:
        print('Closing lambda function')
        return {
            'statusCode': 400,
            'body': json.dumps('Error adding device')
        }
            
            
    return {
                'statusCode': 200,
                'body': json.dumps('Device added!')
            }
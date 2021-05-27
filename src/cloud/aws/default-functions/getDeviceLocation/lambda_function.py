import json
import boto3
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    client = boto3.client('dynamodb')
    mqtt = boto3.client('iot-data', region_name='us-east-1')
    
    globalStatus = dynamodb.Table('globalStatus')
    
    uuid = event['uuid']
    
    response = globalStatus.get_item(TableName='globalStatus', Key={'uuid': uuid})
    item = response['Item']
    
    return {    
        'roomNumber': item['roomNumber'],
        'lastPosition': item['lastPosition']
    }
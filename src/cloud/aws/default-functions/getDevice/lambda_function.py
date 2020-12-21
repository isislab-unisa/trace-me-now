import json
import boto3

def lambda_handler(event, context):  
    dynamodb = boto3.resource('dynamodb')  
    
    globalStatus = dynamodb.Table('globalStatus') 
    
    uuid = event['uuid']
    
    response = globalStatus.get_item(TableName='globalStatus', Key={'uuid': uuid})
    
    return {    
        'device': response['Item'] 
    }
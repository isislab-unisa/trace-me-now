import json
import boto3

def lambda_handler(event, context):  
    
    dynamodb = boto3.resource('dynamodb')  
    
    globalStatus = dynamodb.Table('globalStatus') 
    
    response = globalStatus.scan()  
    
    return {    
        'devices': response['Items'] 
    }
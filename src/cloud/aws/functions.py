# newDevice
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
            'raspberryId': device['raspberryId']
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
    
# getDevicePosition
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

# getDevice
import json
import boto3

def lambda_handler(event, context):  
    dynamodb = boto3.resource('dynamodb')  
    
    globalStatus = dynamodb.Table('globalStatus') 
    
    uuid = event['uuid']
    
    response = globalStatus.get_item(Key{'uuid': uuid})  
    
    return {    
        'device': response['Items'] 
    }

# updateDevices
import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    client = boto3.client('dynamodb')
    mqtt = boto3.client('iot-data', region_name='us-east-1')
    
    globalStatus = dynamodb.Table('globalStatus')
    
    devices = event['devices']
    
    for device in devices:
        res = {'roomNumber': device['roomNumber'], 'lastPosition': device['lastPosition']}
        response = mqtt.publish(
            topic='notify/position/'+device['uuid'],
            qos=1,
            payload=json.dumps(res)
        )
        
        d = globalStatus.get_item(Key={'uuid': device['uuid']})
        d = d['Item']
        
        if d['roomNumber'] != device['roomNumber'] and d['raspberryId'] != device['raspberryId']:
            change = {
                "fromRoom": d["roomNumber"],
                "toRoom": device['roomNumber'],
                "fromRaspberry": d["raspberryId"],
                "toRaspberry": device['raspberryId']
            }
            response = mqtt.publish(
                topic='notify/change/'+device['uuid'],
                qos=1,
                payload=json.dumps(res)
            )
        
        try:
            globalStatus.put_item(Item={
                'uuid': device['uuid'],
                'lastSeen': device['lastSeen'],
                'lastPosition': device['lastPosition'],
                'roomNumber': device['roomNumber'],
                'raspberryId': device['raspberryId']
                }
            )
        except:
            print('Closing lambda function')
            return {
                    'statusCode': 400,
                    'body': json.dumps('Error updating list')
            }
    return {
            'statusCode': 200,
            'body': json.dumps('List updated!')
        }

# deleteDevice
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

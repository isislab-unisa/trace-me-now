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
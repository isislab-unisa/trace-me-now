import json

def lambda_handler(event, context):
    print("Function triggered by the event: ", event)

    return {
            'statusCode': 200,
            'body': json.dumps('Ok!')
        }
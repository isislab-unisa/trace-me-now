# Amazon Web Services
Scenarios with many devices involved can exploit cloud computing to gain scalability and performance and many other advantages. In detail, TraceMeNow exploits the AWS services handling all the processes regarding the cloud services automatically, from their creation to the integration within the IPS, abstracting the developer from the interaction with the cloud provider.

The AWS architecture employs the Amazon Web Services environment. 

The server engine is realized using AWS Lambda functions, the serverless service of AWS. TraceMeNow uses Lambda functions to perform the actions in response to the events and manage interaction with the other components.
The Event/Notification system is based on AWS IoT Core acting as the MQTT broker.
The database is implemented through Amazon DynamoDB.
The interaction with the application module relies on Amazon API Gateway. The APIs represent the trigger of the Lambda functions, working as entry points. For instance, any database operation is performed using the endpoint provided by API Gateway.
Finally, the system security is based on AWS Identity and Access Management that enables the access management to the AWS services using specific roles and policies enhancing the privacy protection within applications. Moreover, all the tracking nodes need to have an AWS PEM certificate to access the environment.

All the services required in the cloud architecture can be deployed using dedicated scripts provided by TraceMeNow.
New events and functions can be created without using the AWS console, thanks to specific scripts abstracting the interaction with the provider.

# Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Custom functions and events](#custom-functions-and-events)
- [APIs](#apis)
- [Notification system](#notification-system)

## Requirements

- Install the AWS CLI and configure it.
- Export the AWS Account Id and Region:

```bash
~$ export ACCOUNT_ID=<xxxxxxxxxxxx>
~$ export AWS_REGION=<your_aws_region>
```

## Installation

Using the script within the `src/cloud/aws` folder allows to deploy all the required resources on the AWS account configure automatically. It might take some minute.

```bash 
~$ ./initialize.sh
```

Onche the script execution is finished, the resulting environment will be up and running with the following resources:
- a new DynamoDB database instance, named `globalStatus`;
- a new IAM role named `TraceMeNowRole`;
- a new IAM policy named `TraceMeNowPolicy`;
- all the default Lambda functions within the `default-functions/` folder;
- all the default APIs configured as triggers for the Lambda functions;
- a text file named `src/cloud/aws/apis.txt` including the uploaded APIs and the endpoints;
- all the default IoT rules configured as triggers for the Lambda functions;
- a new "thing" on IoT Core platform named `RaspberryPi`, with an attached certificate and a policy named `RaspberryPiPolicy`;
- three PEM certificates named `raspberry_certificate.pem.crt`, `raspberry_public_key.pem`, and `raspberry_private_key.pem`.

**IMPORTANT:** the PEM certificates – `raspberry_certificate.pem.crt`, `raspberry_public_key.pem`, `raspberry_private_key.pem` – need to be placed on the tracking node, within the folder `tracking-node/root/certs/`. The certificate allows the authentication of the devices and the access to the IoT Core service.

## Custom functions and events

New events and functions can be added without using directly the AWS console. In detail, the new Lambda function can be written in Python code. A new API Gateway represents the entry point, while the IoT core provides the implementation of the trigger event generated when a message comes from a specific MQTT topic. The function deployment is done automatically through provided scripts making the integration phase as simple as possible.

### Creating a new Lambda function
Create a new folder `custom-function/functionExample/` and write the code in a file named `lambda_function.py`, if using python.It is important to note that all the default functions are written in python and run on a python3.7 runtime.

*Note: any folder name works, however, it is important that the code resides in a file with a specific name, based on the programming language and runtime required. For example, `lambda_function.py` if using Python*.

The following command allows the deploy of the function:

```bash
~$ ./function-deploy.sh custom-functions/functionExample/lambda_function.py
```

By default, the script assumes the use of the `python3.7` runtime.
A different runtime can be specified as second parameter using the same command:

```bash
~$ ./function-deploy.sh custom-functions/functionExample/index.js nodejs
```

*For all the runtimes, please refer to the official Amazon documentation.*

The following command allows to trigger the new function through API:

```bash
~$ ./api-deploy.sh apiExample functionExample GET
```

The first parameter specifies the name of the API, the second one specifies the name of the function deployed before, and the third one specifies the API method – *e.g.*, GET, POST, PUT, etc. –. The new API description will be appended to the `apis.txt` file generated during the initialization phase.

The following command allows to add a new IoT rule as the trigger of the function:

```bash
~$ ./iot-rule-deploy.sh ruleExample functionExample topic/example
```

The first parameter specifies the IoT rule name, the second one specifies the name of the function, and the last one specifies the MQTT topic that trigger the function when a new message is published.

*For the default events and notifications, please refer to [Notification system](#notification-system).*

## APIs

The default provided APIs are documented in this section.

- `aws-endpoint/tracemenow/getDevices` method `GET`: returns an array of all devices present in the system at the moment
```json
// response

{
    "devices": [
        {
            "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
            "lastPosition": "1.26",
            "lastSeen": "11:20",
            "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
            "roomNumber": "1"
        },
        {
            "uuid": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
            "lastPosition": "1.62",
            "lastSeen": "11:23",
            "raspberryId": "550e8400-e29b-41d4-a716-446655440000",
            "roomNumber": "2"
        }
    ]
}
```
A successful request will returns status code `200`, `404` otherwise.

- `aws-endpoint/tracemenow/getDevice/` method `POST`: returns the device with the specified uuid
```json
// request body

{ "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95" }
```
```json
// response

{ 
    "device": {
        "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
        "lastPosition": "1.26",
        "lastSeen": "11:20",
        "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
        "roomNumber": "1"
    }
}
```
A successful request will returns status code `200`, `404` otherwise.

- `aws-endpoint/tracemenow/getDeviceLocation` method `POST`: returns the current location of the specified device, which uuid must be specified in the request body
```json
// request body

{ "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95" }
```
```json
// response

{
    "lastPosition": "1.26",
    "roomNumber": "1"
}
``` 
A successful request will returns status code `200`, `404` otherwise.

- `aws-endpoint/tracemenow/newDevice` method `POST`: adds the device specified in the request body
```json
// request body

{ 
    "device": {
        "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
        "lastPosition": "1.26",
        "lastSeen": "11:20",
        "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
        "roomNumber": "1"
    }
}
```
A successful request will returns status code `200`, `404` otherwise.

- `aws-endpoint/tracemenow/deleteDevice` method `POST`: deletes the device specified in the request body
```json
// request body

{ 
    "device": {
        "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
        "lastPosition": "1.26",
        "lastSeen": "11:20",
        "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
        "roomNumber": "1"
    }
}
```
A successful request will returns status code `200`, `404` otherwise.

- `aws-endpoint/tracemenow/updateDevices` method `POST`: updates all the devices specified in the request body
```json
// request body

{
    "devices": [
        {
            "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
            "lastPosition": "1.26",
            "lastSeen": "11:20",
            "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
            "roomNumber": "1"
        },
        {
            "uuid": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
            "lastPosition": "1.62",
            "lastSeen": "11:23",
            "raspberryId": "550e8400-e29b-41d4-a716-446655440000",
            "roomNumber": "2"
        },
    ]
}
```
A successful request will returns status code `200`, `404` otherwise.

## Notification System

The Event/Notification system realizes the communication protocol of TraceMeNow exploiting the MQTT protocol.
The system includes two MQTT topics for each event, with some exceptions that use only one topic. The first one is the event topic, where the tracking node publishes the message indicating the detection of an event. The second one is the notification topic, where the function triggered by the event sends the processed data in the form of notification and where the components interested in a particular event will subscribe.
When a change in the system occurs, a message with attached information is sent on the event topic, triggering a function. This function performs some action and then publishes a response on the notification topic. The use of two or more topics for each event type improves the management of the communication granting more control to the developer. For instance, the interested device can subscribe only to the notification topic where the function will publish the elaborated data.
The default topics are detailed below:

| Event           	| Notification         	|
|:-:	|:-:	|
| device/new      	| notify/new           	|
| device/delete   	| notify/delete        	|
| device/location 	| notify/location/**uuid** 	|
| -               	| notify/position/**uuid** 	|
| -               	| notify/change/**uuid**   	|

- *device/new*  - contains the events related to the detection of a new mobile node. The correspondent *notify/new* notification topic notifies all the subscribers every time a device enters into the system;
- *device/delete* - contains the events related to the exit of a mobile node. The correspondent *notify/delete* notification topic notifies all the subscribers every time a device leaves the system;
- *device/location* - the position requests of a specific device. Publishing a message with the *uuid* of the device of interest on this topic allows to receive the device position on the correspondent *notify/location/uuid* notification topic, where the *uuid* will be the one specified;
- *notify/position/uuid* - notifies all the subscribers every time the device position with the specified *uuid* changes;
-*notify/change/uuid* - notifies all the subscribers every time the tracing node of the device with the specified *uuid* changes, i.e., moves under the range of a node different from the previous one.

Additional events can be managed specifiying the event and the notification topic.

### Notification format

All the messages exchanged through the MQTT protocol respect a JSON format depicted below:

```json
{
    "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
    "lastPosition": "1.26",
    "lastSeen": "11:20",
    "trackingNodeId": "249bae15-9d9e-494a-8c74-8c510153d378",
    "roomNumber": "1"
}
```

- `uuid` - unique identifier of the mobile node;
- `lastPosition` - distance in meters between the mobile node and the tracking node under which it is located;
- `lastSeen` - time of the last interaction with the last seen tracking node;
- `trackingNodeId` - identifier of the last seen tracking node;
- `roomNumber` - identifier of the room where the device is located; the room corresponds to the localization area of a tracking node.

Each notification can use all or some of the values. The following are some examples.

### notify/new

```json
{ 
    "device": {
        "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
        "lastPosition": "1.26",
        "lastSeen": "11:20",
        "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
        "roomNumber": "1"
    }
}
```

### notify/delete

```json
{ 
    "device": {
        "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
        "lastPosition": "1.26",
        "lastSeen": "11:20",
        "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
        "roomNumber": "1"
    }
}
```

### notify/location/*uuid*

```json
{
    "lastPosition": "1.26",
    "roomNumber": "1"
}
```

### notify/position/*uuid*

```json
{
    "lastPosition": "1.26",
    "roomNumber": "1"
}
```

### notify/change/*uuid*

```json
{
    "fromRoom": "1",
    "toRoom": "2",
    "fromRaspberry": "249bae15-9d9e-494a-8c74-8c510153d378",
    "toRaspberry": "42D72473-47E6-4F6B-810A-5BD46BC35F9E"
}
```

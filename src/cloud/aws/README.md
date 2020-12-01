# Amazon Web Services

If you are here it means you want your application to be a serverless application. There are a lot of advantages of doing that: there's no need to setup your own server, no need to care about hardware resources, no need to manage an infrastracture, flexibility and elasticity, and a lot more!

Here, we provide you with everything you need to build your own serverless application using the Amazon cloud provider, and to get the most benefits from it!

You will be able to quickly set-up the default functions alongside their triggers, APIs, and a database, by running just a single command. Plus, we provide you with an easy way to deploy your custom functions with their triggers and your custom APIs. Alright, let's start!

# Table of Contents
- [Configuration](#configuration)
- [Initial deployment](#initial-deployment)
- [Custom functions and events](#custom-functions-and-events)
- [APIs](#apis)

## Configuration

First of all, you will need to install the `aws-cli` and configure it. It's highly recommended to follow the official Amazon documentation for such a purpose.

Once installed, you can configure it by running

```bash
~$ aws configure
```

or you can even create these two files

- **`~/.aws/config`**

```
[default]
region=<your_region>
```

- **`~/.aws/credentials`**

```
[default]
aws_access_key_id=<your_access_key_id>
aws_secret_access_key=<your_secret_access_key>
aws_session_token=<your_session_token>
```

By the way, for all the configuration stuff, we suggest to have a look to the official Amazon documentation.

Once you have configured everything properly, you have just one last step to do. You just need to export two variables: `ACCOUNT_ID` and `AWS_REGION`.

To get your ID go to the AWS home page and select your username in the top right and click on “My Account”. You should see your account id under Account Settings.

```bash
~$ export ACCOUNT_ID=<xxxxxxxxxxxx>
```
You can get your AWS region right near your username in the top right. The AWS region is something like `us-east-1`.

```bash
~$ export AWS_REGION=<your_aws_region>
```

Now you're ready to go!

## Initial deployment

What you have to do is clone the repository

```bash
~$ git clone https://github.com/isislab-unisa/trace-me-now
```

or just download the `src/cloud/aws/` folder. Move in the `aws/` folder and run

```bash 
~$ ./initialize.sh
```

This script will deploy all the default settings automatically on your AWS for you. It might take some minute, depending also on your Internet connection.

Notice that you will receive many responses from AWS in your terminal. They are summaries on what is happening. If you are interested in them you can take your time to read them, otherwise just skip them by pressing `q`.

Once the script will be finished its execution, you will end up with:
- a new NoSQL database configured on your DynamoDB, named `globalStatus`;
- a new IAM role named `TraceMeNowRole`;
- a new IAM policy named `TraceMeNowPolicy`;
- all the default lambda functions in the `default-functions/` folder uploaded on your AWS Lambda;
- all the default APIs configured on your API Gateway as triggers for the lambda functions;
- a new file `src/cloud/aws/apis.txt` which describes the uploaded APIs and their own endpoints in order to use them;
- all the default IoT rules configured on your IoT Core as triggers for the lambda functions;
- a new thing on your IoT Core platform named `RaspberryPi`, with an attached certificate to wich is attached a policy named `RaspberryPiPolicy`
- three new files in `src/cloud/aws/` folder named `raspberry_certificate.pem.crt`, `raspberry_public_key.pem`, and `raspberry_private_key.pem`.

**IMPORTANT:** remove the three files – `raspberry_certificate.pem.crt`, `raspberry_public_key.pem`, and `raspberry_private_key.pem` – from there and place them on your Raspberry Pi boards in `raspberry/root/certs/`. They will need those files in order to authenticate and to prove their identities to the IoT Core platform.

That's it! Now your back-end is ready to receive requests from all the smartphones and Raspberry Pis of your system, react to events, and send responses to them.

## Custom functions and events

You can now add new functions and configure them with API Gateway – in order to be triggered by calling an API – and/or with an IoT rule – to make them to react when a message comes from a specific MQTT topic –. You won't need to act on your AWS console, but you can do everything locally on your machine and configure it all with simple commands.

For example, you may want to create a new lambda function. You can create a new folder `custom-function/functionExample/` and write your code in a file named `lambda_function.py` (if using python) with your favorite IDE or text editor – notice that all the default functions are written in python and run with a python3.7 runtime –.

*Note: you can name your folders as you like, but it is important that your code resides in a file with a specific name, based on the programming language and runtime you want to use – e.g., `lambda_function.py` if using python –. For that, it is highly recommended to refer to the official Amazon documentation*.

Once your function is ready to be deployed, you can easily do it by simply running

```bash
~$ ./function-deploy.sh custom-functions/functionExample/lambda_function.py
```

By default, this script assumes that you want to use the `python3.7` runtime. If not, you can specify your favorite runtime as second parameter, like

```bash
~$ ./function-deploy.sh custom-functions/functionExample/index.js nodejs
```

*For all the runtimes, please refer to the official Amazon documentation.*

If you want to trigger your new function through an API, you can easily specify one by simply running

```bash
~$ ./api-deploy.sh apiExample functionExample GET
```

where the first parameter is the name of your API, the second one is the name of the function deployed before, and the third one specifies the API method – *e.g.*, GET, POST, PUT, etc. –. Your new API description will be appended to the `apis.txt` file generated during the initialization phase.

If you want to add an IoT rule as a trigger of your function – *i.e.*, to trigger it when a message comes from a specific topic – just run

```bash
~$ ./iot-rule-deploy.sh ruleExample functionExample topic/example
```

where the first parameter specifies the IoT rule name, the second one specifies the name of your function, and the last one specifies the MQTT topic on which you want to receive messages in order to trigger your function.

For the default events and notifications, please refer to [Notification system](https://github.com/isislab-unisa/trace-me-now/tree/dev#notification-system).

## APIs

The default provided APIs are documented in this section.

- `aws-endpoint/tracemenow/getDevices` method `GET`: it returns an array of all devices present in the system at the moment
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
You will receive a status code `200` if your request was fine, `404` otherwise.
- `aws-endpoint/tracemenow/getDevice/` method `POST`: it returns the device with the specified uuid
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
You will receive a status code `200` if your request was fine, `404` otherwise.
- `aws-endpoint/tracemenow/getDeviceLocation` method `POST`: it returns the desired device's actual location once, which uuid must be specified in the request body
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
You will receive a status code `200` if your request was fine, `404` otherwise.
- `aws-endpoint/tracemenow/newDevice` method `POST`: it adds the device specified in the request body
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
You will receive a status code `200` if your request was fine, `404` otherwise.
- `aws-endpoint/tracemenow/deleteDevice` method `POST`: it deletes the device specified in the request body
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
You will receive a status code `200` if your request was fine, `404` otherwise.
- `aws-endpoint/tracemenow/updateDevices` method `POST`: it updates all the devices specified in the request body
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
You will receive a status code `200` if your request was fine, `404` otherwise.
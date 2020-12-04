# Self Hosted Server

This is a python module which lets you easily build your custom on-premise server, handling every event and notification, and managing the communication with a MongoDB NoSQL database - *i.e.*, keeping track of the global status of your system. All of the heavy lifting of managing everything is delegated to the framework itself, all you have to do is launch a new server, and create your custom triggers to events and notifications. Alright, let's start!

# Table of Contents
- [Configuration](#configuration)
- [Initial deployment](#initial-deployment)
- [Custom functions and events](#custom-functions-and-events)
- [APIs](#apis)

## Configuration

At first, you will need to install `docker` and `docker-compose`, for which it's highly recommended the official docker documentation. It will be used a docker-compose file which automates the deployment and allows you to easily satisfy the server dependencies. In fact, it will provide you with three containers: a container which will run a MongoDB service, another one for the Mosquitto service, and a third one that provides you with the environment to run your own server, without having to install all the needed dependencies.

Notice that the above is for information purposes only, you won't need to setup anything, instead, everything will be autoconfigured. Alright, let's start!

Clone the repository 

```bash
~$ git clone https://github.com/isislab-unisa/trace-me-now
```

or just download the `src/self-hosted/` folder.

Then you will need to move in the `docker-compose` folder, and only for the first time run the `inizialize.sh` script

```bash
~$ cd trace-me-now/src/self-hosted/docker/docker-compose/
~$ ./initialize.sh
```

This script will create a folder in your home path called `self-hosted`. This folder will be shared with the docker container equipped with the environment needed to run your own server. You will find in it a folder called `root/`, which contains the on-premise framework, and a file named `main.py`. You will start developing your server in this file, and you can even add as many files and directories as you want at the same level of the `root/` folder. Every change you apply to `/home/$USER/self-hosted/` will be applied on `/home/self-hosted/` in the container as well.

Notice that you may need to change the `root/settings.py` file with your custom configurations

```python
# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False

# MongoDB Settings
MONGO_URI = 'mongodb://<your host machine IP address>:27017/globalStatus'

# MQTT Settings
MQTT_ADDRESS = '<your host machine IP address>'
MQTT_PORT = 1883
MQTT_TIMEOUT = 60
```

Even though the MongoDB and Mosquitto services run in isolated containers, they will be seen from the external with the host machine IP address. So, replace `<your host machine IP address>` with your host machine IP address, so that your server will have access to them. Your server will be seen from the external with your host machine IP address as well, but if you want to access to it from the machine itself (for instance, to test the APIs), you will have to use the container IP address.

## Initial deployment

Now you can develop your server from your host machine with your favorite IDE, and when you're ready to launch or test it, you can launch the docker-compose file with

```bash
~$ docker-compose up
```

which will run MongoDB, Mosquitto, and your server environment in three different containers.

If you want to access to the server environment container bash, just run

```bash
~$ docker exec -it tracemenow-server bash
```

## Custom functions and events

If you have a look to the `main.py` file you will find this

```python
import root.server as server

if __name__ == "__main__":
    server.start_server()
    
    foo = """def new_function(_message):
                // do some operation
                return some_value"""

    server.new_event("event/new", "event/response", foo)
```

It imports the framework with the name `server` and you can start your server by calling the `start_server()` method.

If you want to run you server over the https protocol, you can use

```python
server.start_server_https()
```

instead of `server.start_server()`. In order to do that, you have to put your certificate and private key, named respectively `cert.pem` and `key.pem`, in `root/certs/`. You can use your own certificate or you can generate a trial one with

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

That's it! Your server is running and will handle all the default notifications and provide the APIs for you.

*If you want to know more about default notifications and APIs, please visit the [APIs](#apis) and [Notification system](https://github.com/isislab-unisa/trace-me-now/tree/dev#notification-system) sections.*

Now you can add your custom events and notifications, as many as you want. In order to do that, you can define a function to put in a string variable, using the python syntax. This function will define what to do everytime the event is triggered. The parameter `_message`, which the function takes in input, is the message received on the triggering MQTT topic. So, `_message` will contain the data sent on that topic, and you can use such data for your purposes and for creating your response. The return value of your function will be then published on the response MQTT topic.

Then, by calling the `new_event()` method, you will create a new event to be triggered. The first parameter defines the topic where the event is generated, the second parameter defines the topic where a response is provided (such as a notification), and the third one is the function defined before, which defines the actions to take when the event is triggered.

The following could be a more clear example

```python
import root.server as server

if __name__ == "__main__":
    server.start_server()
    
    foo = """
def new_function(_message):
    from flask import Flask
    from flask import jsonify, request
    from flask_pymongo import PyMongo

    app = Flask(__name__)

    app.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/newTable"
    mongo = PyMongo(app)

    mongo.db.newCollection.insert({
            'newValue': _message
        })
    
    return 'newValue successfully updated with: ' + _message"""

    server.new_event("value/update", "value/update/response", foo)
```

In this example, the function imports the needed dependencies only for the execution time, so it will be even more optimized with respect of a common function. Here, when a new value comes from the `value/update` topic, it will be saved in a MongoDB table named `newTable`. Once this value is saved, a response is published on the topic `value/update/reponse`.

Now you're ready to go! You can define as many new events as you want with so much simplicity, while still benefitting of the default events provided and managed by the framework itself!

## APIs

The default provided APIs are documented in this section.

- `server-ip/getDevices` method `GET`: it returns an array of all devices present in the system at the moment
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
- `server-ip/getDevice/` method `POST`: it returns the device with the specified uuid
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
- `server-ip/getDeviceLocation` method `POST`: it returns the desired device's actual location once, which uuid must be specified in the request body
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
- `server-ip/newDevice` method `POST`: it adds the device specified in the request body
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
- `server-ip/deleteDevice` method `POST`: it deletes the device specified in the request body
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
- `server-ip/updateDevices` method `POST`: it updates all the devices specified in the request body
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
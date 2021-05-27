# Self Hosted Server

The on-premise architecture is suited for small systems with few devices involved and grants low cost if not null. The low requirements of the application module enable the use of a regular computer for the execution. This library handles all the needed tasks automatically, from the connection with the database to the communication with other components. However, the developer can customize each process and implement additional functionalities, such as custom events and functions.

The on-premise architecture implements the server using a series of Docker containers making the installation as quick and simple as possible. In detail, a Docker Compose file includes all the dependencies and the services needed.
The server engine is realized through several Python modules while the Event/Notifications system is based on Eclipse Mosquitto.
The database exploits a NoSQL MongoDB database.
Finally, the security of the architecture relies on the Transport Layer Security protocol.

# Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Initial deployment](#initial-deployment)
- [Custom functions and events](#custom-functions-and-events)
- [APIs](#apis)
- [Notification system](#notification-system)



## Requirements

- Docker;
- docker-compose;

## Installation

Using the script within the `src/on-premise/docker/docker-compose` folder allows to create the environment.

```bash
~$ ./initialize.sh
```

The script will create a folder in the home path called `on-premise` shared among all the docker containers needed to run the server. 
The `root` folder contains the on-premise framework and a file named `main.py` that is the starting point of the server.
It is possible to add as many files and directories needed at the same level of the `root` folder. Every change applied to the `/home/$USER/on-premise/` folder will be applied on `/home/on-premise/` folder in the container as well.

Changes to the `root/settings.py` file may be needed to customize the configuration.

```python
# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False

# MongoDB Settings
MONGO_URI = 'mongodb://<host machine IP address>:27017/globalStatus'

# MQTT Settings
MQTT_ADDRESS = '<host machine IP address>'
MQTT_PORT = 1883
MQTT_TIMEOUT = 60
```

Even though the MongoDB and Mosquitto services run in isolated containers, they will be seen from the external with the host machine IP address. So, the host machine IP address need to be set here `<your host machine IP address>` to let the server access the container. The server will be seen from the external using the host machine IP address as well, but to access to it from the machine itself (for instance, to test the APIs), the container IP address is needed.

The following command allow to launch the server running the Python engine, MongoDB and Mosquitto in three different containers:

```bash
~$ docker-compose up
```

To access to the server container bash, run the following command:

```bash
~$ docker exec -it tracemenow-server bash
```

### Launching the module

Starting from scratch, firstly import the server module

```python
import root.server as server
```

The start the server

```python
server.start_server()
```

even over the https protocol

```python
server.start_server_https()
```

This will require certificate and private key, named respectively `cert.pem` and `key.pem`, in `root/certs/`. 
A new certificate can be generated with the following command:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

A this point the server is ready to run handling the default notifications and providing the default APIs.

*For the default events and notifications, please refer to [Notification system](#notification-system). For the deafult APIs, pleare refer to [APIs](#apis).*

## Custom functions and events

New events, functions and APIs can be added, the `main.py` file shows some examples.

To add a new custom API, firstly define the code – *i.e.* the method to be executed when the API is called. The code has to be inside a string variable. It is possible to write it in Python language and importing any module.

```python
foo = """
def post_function(_json):
    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.127:27017/newTable"
    mongo = PyMongo(pymongo)

    mongo.db.newCollection.insert({
            'newValue': _json['value']
        })

    res = jsonify("Value added succesfully!")
    res.status_code = 200

    return res"""
```

The function input parameter `_json` is the body request content. The returned value is the response sent to the client.

To deploy the function use the following method. The first parameter specifies the function defined before, the second one specifies the path where to call the API and the last one specifies the API method – *e.g.*, GET, POST, PUT, etc. –.

```python
server.new_api(foo, 'newValue', 'POST')
```

*Do not include the `/` character in the API path since it will be automatically added.For example, the `newValue` path means that the API is avaible in `server_ip_address:server_port/newValue`.*

To add a new event the procedure follows the API one.
Firstly defines the function in a string variable using the Python language. This function specifies the behavior when the event is triggered.
The function input parameter `_message` is the message received on the related MQTT topic and contains the data sent on that topic. The returned value will be published on the MQTT topic specified.

```python
foo = """
def new_event(_message):
    upper = _message.upper()

    return upper"""
```

The event can be created using the following method. The first parameter specifies the topic where the event will be generated, the second one specifies the topic where the response is provided, and the third one specifies the function described, which defines the behavior when the event is triggered.

```python
server.new_event('event/new', 'event/new/response', foo)
```

## APIs

The default provided APIs are documented in this section.

- `server-ip/getDevices` method `GET`: returns an array of all devices present in the system at the moment
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

- `server-ip/getDevice/` method `POST`: returns the device with the specified uuid
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

- `server-ip/getDeviceLocation` method `POST`: returns the desired device's actual location once, which uuid must be specified in the request body
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

- `server-ip/newDevice` method `POST`: adds the device specified in the request body
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

- `server-ip/deleteDevice` method `POST`: deletes the device specified in the request body
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

- `server-ip/updateDevices` method `POST`: updates all the devices specified in the request body
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

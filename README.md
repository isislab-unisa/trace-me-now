
# Trace Me Now

Trace Me Now is an open-source framework which helps developers in building their own IoT-based localization and tracking systems. Its aim is to let developers build systems capable of localizing and keeping track of people through their smartphones, using *Bluetooth Low Energy (BLE)* technology. For doing that, Trace Me Now offers a client library -  available for Android only, with future developments will be available for iOS as well - that allows to transmit BLE packets in broadcast, which will be sensed by Raspberry Pi boards. In fact, this framework provides a library for Raspberry Pi boards too, which will allow to sense, localize, and keep track of the users' smartphones. Furthermore, Raspberry Pis will have to interact with a back-end, as the client as well. You can choose between building a serverless application or not. If so, you can choose AWS or Microsoft Azure as cloud provider; otherwise Trace Me Now offers you a python library for easily developing a server for an on-premise solution. Below are reported the two general architecture you can build by using this framework.

![General Serverless Architecture](docs/img/architecture.png "Evolution of Cloud Computing")  
*General Serverless Architecture*

![General Server Architecture](docs/img/architecture-server.png "Evolution of Cloud Computing")  
*General Server Architecture*

# Table of Contents
- [Android Library](#android-library)
  - [BleSetup](#blesetup)
  - [OnPremiseMqtt](#onpremisemqtt)
  - [AwsMqtt](#awsmqtt)
- [Raspberry Pi Library](#raspberry-pi-library)
- [Notification System](#notification-system)

## Android Library

In order to use this library, create a new Android Studio project and add the following in your root `build.gradle` at the end of repositories

```gradle
	allprojects {
		repositories {
			...
			maven { url 'https://jitpack.io' }
		}
	}
```

and add the dependency

```gradle
	dependencies {
	        implementation 'com.github.spike322:tracemenow-android-library:Tag'
	}
```

Now you're ready to go! 

This library helps you to configure BLE transmission and allows you to communicate with your serverless or serverful back-end.

It offers three classes: `BleSetup`, `OnPremiseMqtt`, and `AWSMqtt`.

*If you want to have a more clear idea on how to use this library, please have a look to `src/client/android/app/src/main/java/com/mauro/tracemenow_client/MainActivity.java`, there is an example on how to use everything.*

### BleSetup

The `BleSetup` allows you to check if bluetooth is enabled and if your device supports BLE technology. All you have to do is to instantiate a new object of this class, and you can do it in two different ways:

```java
BleSetup bleSetup = new BleSetup(activity, context, 0, 0);
```
or
```java
BleSetup bleSetup = new BleSetup(activity, context);
```
The first one allows you to specify the `minor` and `major` values, in case you need some specific ones. In the second case they will be generated at a random.

Then you can call

```java
bleSetup.startTransmitting();
```
to initiate the transmittion. Your smartphone will continuously send BLE packets in broadcast.

When you start the transmission, it will check if your bluetooth is enabled - and in that case it will ask you to activate it - and if your device supports BLE technology. If so, it will return a `true` value, `false` otherwise.

In order to stop the transmission, you can use

```java
bleSetup.stopTransmitting();
```
### OnPremiseMqtt

The `OnPremiseMqtt` allows you to receive notifications from the system, when using an on-premise back-end, and to define a behaviour for each notification, as well as remove reception of notifications.

**NOTE: if you use OnPremiseMqtt, you won't use AWSMqtt and vice versa.**

*If you want to know more about the notification system, please take a look to [Notification System](#notification-system).*

Here, first thing you have to do is to define a callback, which mainly defines the behaviour when a message arrives

```java
MqttCallbackExtended callback = new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean reconnect, String serverURI) {
                if (reconnect) {
                    // re-subscribe to topics
                } else {

                }
            }

            @Override
            public void connectionLost(Throwable cause) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                if(topic.equals("notify/new")) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/delete")) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/location/"+mqttClient.getClientId())) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/position/"+mqttClient.getClientId())) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("custom/topic")) {
                    Log.i(LOG_TAG, message.toString());
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {

            }
        };
```

In the `messageArrived()` method you can check from which topic the message arrives and define a specific behaviour.

Now you can instantiate your mqtt client

```java
OnPremiseMqtt mqttClient = new OnPremiseMqtt(activity, context, ipAddress, mosquittoPort, callback);
```

specifying the activity, context, ip address, port, and the callback defined previously. For example, if you are using it in your main activity, you could just use `this` instead of activity and context.

Once this is done, you're able to connect to the broker

```java
mqttClient.connect();
```

Now that you are connected, you might want to subscribe to some (or even all) of the [default events](#notification-system) in order to receive notifications, or you might want to get some custom notification.

```java
mqttClient.getNewDeviceNotification();
```

By calling this method, you will subscribe to the *'notify/new'* topic and you will receive a message every time a new device comes in.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getDeleteDeviceNotification();
```

By calling this method, you will subscribe to the *'notify/delete'* topic and you will receive a message every time a device leaves the system.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getLocationNotification();
```

Each time you will call this method, you will receive your current location once.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getPositionNotification();
```

By calling this method, you will receive your updated current location continuously until you unsubscribe from it.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getChangeNotification();
```

By calling this method, you will receive a notification everytime your device changes *room/raspberry*.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getCustomNotification("custom/topic");
```

By calling this method, you will subscribe to your custom topic, specified as a parameter, and you will receive a message every time something is published on it.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

At some point, you might don't want to receive some notification anymore, so you can unsubscribe to topics.

```java
mqttClient.removeNewDeviceNotification();
```

By calling this method, you will unsubscribe from the *'notify/new'* topic and you won't receive such a notification anymore.

```java
mqttClient.removeDeleteDevicesNotification();
```

By calling this method, you will unsubscribe from the *'notify/delete'* topic and you won't receive such a notification anymore.

```java
mqttClient.removeLocationNotification();
```

By calling this method, you will unsubscribe from the *'notify/location/uuid'* topic and you won't receive such a notification anymore.

```java
mqttClient.removePositionNotification();
```

By calling this method, you will unsubscribe from the *'notify/position/uuid'* topic and you won't receive such a notification anymore.

```java
mqttClient.removeChangeNotification();
```

By calling this method, you will unsubscribe from the 'notify/change/uuid' topic and you won't receive such a notification anymore.

```java
mqttClient.removeCustomNotification("custom/topic");
```

By calling this method, you will unsubscribe from the topic specified as a parameter.

### AwsMqtt

The `AwsMqtt` allows you to receive notifications from the system, when using a serverless back-end running on AWS, and to define a behaviour for each notification, as well as remove reception of notifications.

**NOTE: if you use AWSMqtt, you won't use OnPremiseMqtt and vice versa.**

*If you want to know more about the notification system, please take a look to [Notification System](#notification-system).*

First thing you have to do is to instantiate an object of the `AwsMqtt` class

```java
AWSMqtt awsClient = new AWSMqtt(activity, context, "*****.amazonaws.com", "us-east-1:*****");
```

specifying the activity, context, your customer endpoint, and the cognito pool id. For example, if you are using it in your main activity, you could just use `this` instead of activity and context.

Once this is done, you're able to connect to the IoT Core platform

```java
awsClient.connect();
```

Now that you are connected, you might want to subscribe to some (or even all) of the [default events](#notification-system) in order to receive notifications, or you might want to get some custom notification.

```java
awsClient.getNewDeviceNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```
By calling this method, you will subscribe to the *'notify/new'* topic and you will receive a message every time a new device comes in.
Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

```java
awsClient.getDeleteDeviceNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

By calling this method, you will subscribe to the *'notify/delete'* topic and you will receive a message every time a device leaves the system.
Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

```java
awsClient.getLocationNotification(new AWSIotMqttNewMessageCallback() {
              @Override
              public void onMessageArrived(String topic, byte[] data) {
                  runOnUiThread(new Runnable() {
                      @Override
                      public void run() {
                          try {
                              String message = new String(data, "UTF-8");
                              Log.d(LOG_TAG, "Message arrived:");
                              Log.d(LOG_TAG, "   Topic: " + topic);
                              Log.d(LOG_TAG, " Message: " + message);

                              JSONObject jsonObject = null;
                              try {
                                  jsonObject = new JSONObject(message);
                              } catch (JSONException e) {
                                  e.printStackTrace();
                              }

                              JSONObject device = jsonObject.getJSONObject("device");
                          } catch (UnsupportedEncodingException | JSONException e) {
                              Log.e(LOG_TAG, "Message encoding error.", e);
                          }
                      }
                  });
              }
        });
```

Each time you will call this method, you will receive your current location once.
Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

```java
awsClient.getPositionNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```
By calling this method, you will receive your updated current location continuously until you unsubscribe from it. Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

```java
awsClient.getChangeNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

By calling this method, you will receive a notification everytime your device changes *room/raspberry*. Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

```java
awsClient.getCustomNotification("custom/topic", new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject value = jsonObject.getJSONObject("value");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

By calling this method, you will subscribe to your custom topic, specified as a parameter, and you will receive a message every time something is published on it. Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

At some point, you might don't want to receive some notification anymore, so you can unsubscribe to topics.

```java
awsClient.removeNewDeviceNotification();
```

By calling this method, you will unsubscribe from the *'notify/new'* topic and you won't receive such a notification anymore.

```java
awsClient.removeDeleteDevicesNotification();
```

By calling this method, you will unsubscribe from the *'notify/delete'* topic and you won't receive such a notification anymore.

```java
awsClient.removeLocationNotification();
```

By calling this method, you will unsubscribe from the *'notify/location/uuid'* topic and you won't receive such a notification anymore.

```java
awsClient.removePositionNotification();
```

By calling this method, you will unsubscribe from the *'notify/position/uuid'* topic and you won't receive such a notification anymore.

```java
awsClient.removeChangeNotification();
```

By calling this method, you will unsubscribe from the 'notify/change/uuid' topic and you won't receive such a notification anymore.

```java
awsClient.removeCustomNotification("custom/topic");
```

By calling this method, you will unsubscribe from the topic specified as a parameter.


## Raspberry Pi Library

This library has been built and tested on a Raspberry Pi 4 Model B, but it should run on any kind of Raspberry board with a built-in bluetooth module.

You can install your favorite linux distro on your Raspberry Pi, and before starting, you will have to install some few dependencies.

```
 - git
 - nodejs
```

First, you can download the entire repository

```bash
~$ git clone https://github.com/isislab-unisa/trace-me-now.git
```

or just download the `src/raspberry/` folder.

After that, you should move in the library folder and install all the needed dependencies

```bash
~$ cd trace-me-now/src/raspberry/root/
~$ sudo npm i
```
Last, but not least, you will have to create a `.env` file at the same level of the `root/` folder with these parameters

```
NODE_ENV=development

ON_PREMISE= # true or false

#### AWS Properties

MERGE_STATUS= # your endpoint
DELETE_DEVICE= # your endpoint
GET_ALL= # your endpoint

KEY_PATH=./certs/your-private-key.pem.key
CERT_PATH=./certs/your-certificate.pem.crt
CA_PATH=./certs/startfield-root-ca-certification.pem
CLIENT_ID=raspberryPi
REGION= # your aws region
HOST= # your aws host
AWS_PORT= # your aws port

### On-premise properties

MQTT_ADDRESS= # your on-premise mqtt broker address
MQTT_PORT= # your on-premise mqtt broker port

ROOM_NUMBER= # the room number where the raspberry has been installed in
```

Set `ON_PREMISE=true` if you don't want to use a serverless solution, `ON_PREMISE=false` otherwise. If you want to use a serverless solution, you will have to set all the AWS properties. If not, you can just skip them and set only the on-premise properties.

It's fundamental to set the `ROOM_NUMBER` parameter. Your Raspberry Pi has to know where it has been installed in. The room number is just an integer value, such as `1`, `2`, `3`, and so on.

Now you're ready to go! 

You start building your project at the same level of the `root/` folder. You can start by following the `example.js` file.

If you want to start from scratch, create a new `js` file and import

```javascript
const BleScanner = require('./root/app');
```
Then instiantiate a new object
```javascript
bleScanner = new BleScanner();
```

And start scanning the environment with

```javascript
bleScanner.startScanning();
```

That's it! The framework will do all the heavy work of sensing devices, localizing them, keeping a local track of them, and synchronize with your back-end, be it serverless or on premise!

If you want to configure some new action and generate a new event, which has to be triggered by your back-end, you can use

```javascript
foo = (someData) => {
    // do some operation
    bleScanner.newEvent('event/new', someData);
}
```

By doing so, you define a new function with your desired behaviour, and when you're ready, you can publish the result with the `newEvent()` function on the specified MQTT topic.

*If you want to know more about the notification system, please take a look to [Notification System](#notification-system).*

This event will be triggered by your back-end, either serverless or serveful, in which you can define your custom events.

*If you want to know more about how to configure new events in your back-end, please take a look to [On-premise Server Library](#on-premise-server-library) or [Amazon Web Services](#amazon-web-services).*

## Self Hosted Server Library

This is a python module which lets you easily build your custom on-premise server, handling every event and notification, and managing the communication with a MongoDB NoSQL database - *i.e.*, keeping track of the global status of your system. All of this heavy lifting of managing everything is delegated to the framework itself, all you have to do is launch a new server, and create your custom triggers to events and notifications. Alright, let's start!

At first, you will need to install some few dependencies

```bash
- git
- pip or pip3
- python or python3
- mosquitto
```

With `git` you can clone the entire repository 

```bash
~$ git clone https://github.com/isislab-unisa/trace-me-now
```

or just download the `src/self-hosted/` folder.

`pip` or `pip3` is used to install all the framework needed dependencies. So move to the `root/` folder and install them.

```bash
~$ cd trace-me-now/src/self-hosted/root/
~$ sudo pip3 install -r requirements.txt
```

Create a new MongoDB database named `globalStatus` and a new collection named `devices`.

Before start developing, take a look to the `src/self-hosted/root/settings.py` file.

```python
# Flask settings
FLASK_DEBUG = True  # Do not use debug mode in production

# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False

# MongoDB Settings
MONGO_URI = 'mongodb://127.0.0.1:27017/globalStatus'

# MQTT Settings
MQTT_ADDRESS = 'localhost'
MQTT_PORT = 1883
MQTT_TIMEOUT = 60
```

You might want to change some parameter of it, or maybe you want to use the default settings.

Now you're ready to go!

*You may way want to take a look to the `src/self-hosted/example.py` file to undesrstand better how to use this module, even though its usage is quite simple.*

If you want to start from scratch, start building your project at the same level of the `root/` folder. Create a new python file and import the module as follows

```python
import root.server as server
```

In order to start your server use

```python
server.start_server()
```

which can be added in your main function or in a different one.

That's it! Your back-end will now handle each [default event](#notification-system), manage the communication with your MongoDB database, and provide you APIs, which are reported [here](#apis).

If you want to listen to a custom event, you will have to define a new function in a string variable, using the python syntax, and add a new event, by specifying the topic where the event is triggered, the topic where to publish a response, and the behaviour when the event is generated (defined in the function described before).

```python
foo = """def new_function(_message):
            // do some operation
            return some_value"""

server.new_event("event/new", "event/response", foo)
```

## Notification System

Notifications are handled through MQTT protocol. For each event, there are two MQTT topics (not in every case as you will see): one where the event is triggered and one where to notify what happened. Below are reported the default events:

| Event           	| Notification         	|
|:-:	|:-:	|
| device/new      	| notify/new           	|
| device/delete   	| notify/delete        	|
| device/location 	| notify/location/**uuid** 	|
| -               	| notify/position/**uuid** 	|
| -               	| notify/change/**uuid**   	|

*device/new* is used to receive entering device and saving them into the system. If you want to receiv a notification every time a device enters into the system you can subscribe to notify/new.

*device/delete* is used to know which device left and consequently update the system. If you want to receiv a notification every time a device leave the system you can subscribe to notify/delete.

**device/location* is used to request the position of a specific device. If you publish the **uuid** on that topic you will receive its position on *notify/location/**uuid***, where **uuid** has to be changed with your device’s **uuid**.

**if you subscribe to *notify/position/**uuid*** you will constantly receive updates of every move of the device with the specified **uuid**.

***if you subscribe to *notify/change/**uuid*** you will receive a notification every time the device with the specified **uuid** changes room/raspberry.

You can create any custom event-notification by specifying the event topic and the notification topic.

### Notification format

As said before, notifications are handled through MQTT protocol, so they are messages exchanged with Json format.

So, both Raspberry and back-end (either serverless or not) have to manage json messages and keep track of devices in a NoSQL database through json. Each device is represented as following

```json
{
    "uuid": "6B41805F-C5DB-47B6-9745-D96F42138D95",
    "lastPosition": "1.26",
    "lastSeen": "11:20",
    "raspberryId": "249bae15-9d9e-494a-8c74-8c510153d378",
    "roomNumber": "1"
}
```

- `uuid` stands for *Universally unique identifier* and, as the name suggests, it is used for uniquely identify each device.
- `lastPosition` is the distance (expressed in meter) of the device from the Raspberry Pi who has detected the device.
- `lastSeen` is the time when that device was last detected by the system.
- `raspberryId` is the identifier of the Raspberry Pi who has last identified that device, which is another **uuid**.
- `roomNumber` is the room where the device is actually in.

Now, for each different notification, some or even all of these values can be used.

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
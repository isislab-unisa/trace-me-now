
# Trace Me Now

Trace Me Now is an open-source framework which helps developers in building their own IoT-based localization and tracking systems. Its aim is to let developers build systems capable of localizing and keeping track of people through their smartphones, using *Bluetooth Low Energy (BLE)* technology. For doing that, Trace Me Now offers a client library -  available for Android only, with future developments will be available for iOS as well - that allows to transmit BLE packets in broadcast, which will be sensed by Raspberry Pi boards. In fact, this framework provides a library for Raspberry Pi boards too, which will allow to sense, localize, and keep track of the users' smartphones. Furthermore, Raspberry Pis will have to interact with a back-end, as the client as well. You can choose between building a serverless application or not. If so, you can choose AWS or Microsoft Azure as cloud provider; otherwise Trace Me Now offers you a python library for easily developing a server for an on-premise solution. Below are reported the two general architecture you can build by using this framework.

![General Serverless Architecture](img/architecture.png "Evolution of Cloud Computing")  
*General Serverless Architecture*

![General Server Architecture](img/architecture-server.png "Evolution of Cloud Computing")  
*General Server Architecture*

# Table of Contents
- [Android Library](#android-library)
  - [BleSetup](#blesetup)
  - [OnPremiseMqtt](#onpremisemqtt)
  - [AwsMqtt](#awsmqtt)
- [Raspberry Pi Library](#raspberry-pi-library)
- [On-premise Server Library](#on-premise-server-library)
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

The `OnPremiseMqtt` allows you to receive notifications from the system and to define a behaviour for each notification, as well as remove reception of notifications.

*If you want to know more about the notification system, take a look to [Notification System](#notification-system).*

Here, first thing you have to do is to define a callback which mainly defines the behaviour when a message arrives

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

In the `messageArrived()` method you can check from wich topic the message arrives and define a specific behaviour.

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
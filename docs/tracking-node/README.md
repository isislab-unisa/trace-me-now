# Tracking Node

The tracking node library is based on Javascript and runs over a NodeJS requiring a device with a compatible operating system in addition to the BLE and Wi-Fi interfaces. The methods included allow the developer to start and stop the scan of the room and communicate with the application module using the Event/Notification system.
Once the scanning is started, the tracking node will automatically localize and track the mobile nodes within the range, sending messages according to the events recorded. It is important to note that each tracking node needs to be configured with the room number where it is placed to perform the localization since the position must be known.
The library provides specific methods supporting the addition of new functionalities, such as introducing new actions in response to events. 
The default configuration involves a series of Raspberry Pi boards as tracking nodes. However, any hardware with Wi-Fi and BLE, compatible with NodeJS, can be used. 

# Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)

## Requirements
- NodeJS
- npm
- git

## Installation

The dependencies installation can be done moving to the `src/tracking-node/root` folder and using npm:

```bash
~$ sudo npm i
```

Create a `.env` file at the same level of the `root` folder with the following parameters:

```
NODE_ENV=development

ON_PREMISE= # true or false

#### AWS properties

MERGE_STATUS= # your endpoint
DELETE_DEVICE= # your endpoint
GET_ALL= # your endpoint

KEY_PATH=./certs/raspberry_private_key.pem
CERT_PATH=./certs/raspberry_certificate.pem.crt
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

`ON_PREMISE=true` will enable the on-premise architecture. This requires setting the on-premise environment.
`ON_PREMISE=false` will enable the cloud architecture. This requires configuring the cloud environment and placing the generated file within the tracking-node device. For instance place `raspberry_certificate.pem.crt`, `raspberry_public_key.pem`, and `raspberry_private_key.pem` in `root/certs` folder. For more information, refer to the [AWS guide](https://github.com/isislab-unisa/trace-me-now/tree/main/src/cloud/aws#amazon-web-services).

The tracking node needs the `ROOM_NUMBER` parameter to know where it is installed. The values is a simple integer.

## Deployment

The `index.js` file contained in the `root` folder is the starting point to launch the application.

Import and instatiation.
```javascript
const BleScanner = require('./root/app');
bleScanner = new BleScanner();
```

The scan of the environment can be started using the following method:

```javascript
bleScanner.startScanning();
```

To implement new actions and new events first define the behavior to perform when the function is triggered. The result of the function can be then published using the `newEvent()` method where the first parameter specifies the destination MQTT topic.

```javascript
foo = (someData) => {
    // do some operation
    bleScanner.newEvent('event/new', someData);
}
```

*More informations about the notification system are avaible in [on-premise notification system](https://github.com/isislab-unisa/trace-me-now/tree/main/src/on-premise#notification-system) or in [AWS notification system](https://github.com/isislab-unisa/trace-me-now/tree/main/src/cloud/aws#notification-system).*

This event will be triggered by your back-end, either serverless or serveful, in which you can define your custom events.

*More informations about new events configuration are avaible in [on-premise architecture](https://github.com/isislab-unisa/trace-me-now/tree/main/src/on-premise#notification-system) or in [AWS architecture](https://github.com/isislab-unisa/trace-me-now/tree/main/src/cloud/aws#notification-system).*
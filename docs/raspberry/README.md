# Raspberry Pi Library

This library has been built and tested on a Raspberry Pi 4 Model B, but it should run on any kind of Raspberry board with a built-in bluetooth module.

# Table of Contents
- [Configuration](#configuration)
- [Building](#building)

## Configuration

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

Set `ON_PREMISE=true` if you don't want to use a serverless solution, `ON_PREMISE=false` otherwise.

If you want to use a serverless solution you can skip the *On-premise properties*, but you will have to set all of the *AWS properties*, and put the files generated during the AWS configuration – `raspberry_certificate.pem.crt`, `raspberry_public_key.pem`, and `raspberry_private_key.pem` – in `root/certs/`. If not done yet, please refer to the [AWS guide](https://github.com/isislab-unisa/trace-me-now/tree/dev/src/cloud/aws#amazon-web-services).

If you don't want to use a serverless solution, you can just skip the *AWS properties*, but you will have to set all of the *On-premise properties*.

In both cases, by the way, it's fundamental to set the `ROOM_NUMBER` parameter. Your Raspberry Pi has to know where it has been installed in. The room number is just an integer value, such as `1`, `2`, `3`, and so on.

Now you're ready to go! 

## Building

You start building your project at the same level of the `root/` folder. You can start by following the `index.js` file.

It starts by importing

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

That's it! The framework will automatically do all the heavy work of sensing devices, localizing them, keeping a local track of them, and synchronize with your back-end, be it serverless or on-premise!

If you want to configure some new action and generate a new event, which has to be triggered by your back-end, you can use

```javascript
foo = (someData) => {
    // do some operation
    bleScanner.newEvent('event/new', someData);
}
```

By doing so, you define a new function with your desired behaviour, and when you're ready, you can publish the result with the `newEvent()` function on the specified MQTT topic.

*If you want to know more about the notification system, please take a look to the [Self-hosted notification system](https://github.com/isislab-unisa/trace-me-now/tree/dev/src/self-hosted#notification-system) or the [AWS notification system](https://github.com/isislab-unisa/trace-me-now/tree/dev/src/cloud/aws#notification-system).*

This event will be triggered by your back-end, either serverless or serveful, in which you can define your custom events.

*If you want to know more about how to configure new events in your back-end, please take a look to [On-premise Server Library](https://github.com/isislab-unisa/trace-me-now/tree/dev/src/self-hosted#self-hosted-server) or [Amazon Web Services](https://github.com/isislab-unisa/trace-me-now/tree/dev/src/cloud/aws#amazon-web-services).*
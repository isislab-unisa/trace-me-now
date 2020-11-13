require('dotenv').config()

if(process.env.ON_PREMISE) {
    console.log("Connecting to Mosquitto... ");
    var mqtt = require('mqtt');

    var client = mqtt.connect(process.env.MQTT_ADDRESS + ":" + process.env.MQTT_PORT, { clientId: process.env.CLIENT_ID })
} else {
    console.log("Connecting to AWS IoT... ");
    var awsIot = require('aws-iot-device-sdk');

    var client = awsIot.device({
        keyPath: process.env.KEY_PATH,
        certPath: process.env.CERT_PATH,
        caPath: process.env.CA_PATH,
        clientId: process.env.CLIENT_ID,
        region: process.env.REGION,
        host: process.env.HOST,
        port: process.env.AWS_PORT
    });
}

client.on('connect', function () {
    console.log('Connected to MQTT broker');
    console.log(' - Press Ctrl+C to stop scanning');
});

client.on('offline', function () {
    console.log('Not connected to MQTT broker');
});

client.on('error', function (err) {
    console.log(err);
});

client.on('close', function() {
   console.log('MQTT broker connection closed');
});

client.on('reconnect', function() {
   console.log('Reconnecting to MQTT broker');
});

const newDevice = function (d) {
	client.publish('device/new', JSON.stringify(d));
}

const updateDevices = function (d) {
    client.publish('device/update', JSON.stringify(d));
}

const deleteDevice = function (d) {
	client.publish('device/delete', JSON.stringify(d));
}

const newEvent = function(topic, data) {
    client.publish(topic, JSON.stringify(data));
}

module.exports = {
    newDevice,
    deleteDevice,
    updateDevices,
    newEvent
}

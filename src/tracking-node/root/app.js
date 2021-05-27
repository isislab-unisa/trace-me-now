require('dotenv').config()

const fs = require('fs');
const Noble = require('noble');
const BeaconScanner = require('node-beacon-scanner');
const devices = require('./devices.json');
var backend_mqtt = require('./mqtt_requests/backend_mqtt');
const uuid4 = require('uuid4');
const Mqtt = require('./mqtt_requests/backend_mqtt');

var roomNumber;
var trackingNodeId;

class BleScanner {

	#scanner;

	constructor() {
		console.log('Starting...');
		console.log('Checking room number... \n');

		roomNumber = process.env.ROOM_NUMBER;

		if(roomNumber === undefined || roomNumber === '') {
			console.log('Please, set the ROOM_NUMBER value in the .env file in the root of the project');
			console.log(' - For more information, please visit https://github.com/isislab-unisa/trace-me-now \n');
			process.exit();
		}

		console.log(`Room number... OK! Tracking Node placed in room number ${roomNumber}`);
		console.log('Checking Tracking Node Id... \n');

		trackingNodeId = process.env.UUID;

		if(trackingNodeId === undefined) {
			console.log('Tracking node ID not set up yet. Generating a new one... ');
			trackingNodeId = uuid4();
			if(uuid4.valid(trackingNodeId)) {
				fs.appendFileSync('.env', 'UUID='+trackingNodeId);
			}
		}

		console.log(`Tracking Node Id... OK! Tracking Node Id: ${trackingNodeId} \n`);

		backend_mqtt = new Mqtt();

		this.#scanner = new BeaconScanner();
	}

	startScanning() {
		// Set up the received packets
		this.#scanner.onadvertisement = (advertisement) => {
			var beacon = advertisement["iBeacon"];
			beacon.uuid = beacon.uuid.toLowerCase();
			const txPower = beacon["txPower"];
			const rxPower = advertisement["rssi"] - 45;
			beacon.rxPower = rxPower;
			beacon.rssi = advertisement["rssi"];
			
			var distance = Math.pow(10, ((txPower - beacon.rssi)/(10*2))); 
			
			distance = distance.toFixed(2);

			this.#checkDevice(beacon.uuid, distance);
		}

		// Start listening for BLE broadcast packets
		this.#scanner.startScan().then(() => {
			console.log("Scanning has started...");
		}).catch(error => {
			console.error(error);
		})

		this.#deleteDevices();
	}

	newEvent(topic, data) {
		backend_mqtt.newEvent(topic, data);
	}

	// Checks if the received packet belongs to a device already seen or a new one
	#checkDevice = function(uuid, distance) {
		if(devices.some(device => device.uuid === uuid)) {
			this.#updateDevices(uuid, distance);	
		} else {
			this.#addDevice(uuid, distance);
		}
	}

	// Add a new device to the list
	#addDevice = function(uuid, distance) {
		const deviceUuid = uuid;
		const deviceLastSeen = new Date().getHours() + ':' + new Date().getMinutes();
		const deviceLastDistance = distance;
		const device = { uuid: deviceUuid, lastSeen: deviceLastSeen, lastPosition: deviceLastDistance, roomNumber: roomNumber, trackingNodeId: trackingNodeId };

		devices.push(device);
		backend_mqtt.newDevice({ device: device });
		this.#writeToFile();
	}


	// Updates the last seen time of an existing device
	#updateDevices = function(uuid, distance) {
		devices.forEach(device => {
			if(uuid === device.uuid) {
				device.lastSeen = new Date().getHours() + ':' + new Date().getMinutes();
				device.lastPosition = distance;
				device.roomNumber = roomNumber;
				device.trackingNodeId = trackingNodeId;
			}	
		});

		backend_mqtt.updateDevices({ devices: devices })
		this.#writeToFile();
	}

	#deleteDevices = function() {
		// Every minute scan every device seen so far and deletes the devices not seen for 5 minutes or more
		setInterval(() => {
			devices.forEach(device => {
				var lastSeen = device.lastSeen.split(':');
				if(parseInt(lastSeen[0]) < new Date().getHours() || ((parseInt(lastSeen[0]) === new Date().getHours()) && (parseInt(lastSeen[1])+5 <= new Date().getMinutes()))) {
					devices.splice(devices.indexOf(device), 1);
					backend_mqtt.deleteDevice({ device: device });
					this.#writeToFile();
				}
			});
		}, 60000);
	}

	// Write changes to the JSON file
	#writeToFile = function() {
		let data = JSON.stringify(devices, null, 2);
		fs.writeFile('./devices.json', data, (err) => {
			if (err) {
					throw err;
			}	
		});	
	}
}

module.exports = BleScanner

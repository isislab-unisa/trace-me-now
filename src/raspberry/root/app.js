const fs = require('fs');
const Noble = require('noble');
const BeaconScanner = require('node-beacon-scanner');
const devices = require('./devices.json');
const backend_https = require('./http_requests/backend_https');
const backend_mqtt = require('./mqtt_requests/backend_mqtt');
const uuid4 = require('uuid4');

class BleScanner {

	roomNumber;
	raspberryId;
	#scanner;

	constructor() {
		console.log('Starting...');
		console.log('Checking room number... \n');

		raspberryId = process.env.UUID;

		if(roomNumber === undefined || roomNumber === '') {
			console.log('Please, set the ROOM_NUMBER value within the .env file in the root of the project');
			console.log(' - For more information, please visit https://github.com/spike322/trace-me-now \n');
			process.exit();
		}

		console.log(`Room number... OK! Raspberry placed in room number ${roomNumber}`);
		console.log('Checking Raspberry ID... \n');

		roomNumber = process.env.ROOM_NUMBER;

		if(raspberryId === undefined) {
			console.log('Raspberry ID not set up yet. Generating a new one... ');
			raspberryId = uuid4();
			if(uuid4.valid(raspberryId)) {
				fs.appendFileSync('.env', 'UUID='+raspberryId);
			}
		}

		console.log(`Raspberry ID... OK! Raspberry ID: ${raspberryId} \n`);

		this.#scanner = new BeaconSscanner();
	}

	startScanning() {
		// Sets up the received packets
		this.#scanner.onadvertisement = (advertisement) => {
			var beacon = advertisement["iBeacon"];
			const txPower = beacon["txPower"];
			const rxPower = advertisement["rssi"] - 45;
			beacon.rxPower = rxPower;
			beacon.rssi = advertisement["rssi"];
			
			var distance = Math.pow(10, ((txPower - beacon.rssi)/(10*2))); 
			
			distance = distance.toFixed(2);

			console.log(beacon);

			this.#checkDevice(beacon.uuid, distance);
		}

		// Starts listening for BLE broadcast packets
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

	// It checks if the received packet belongs to a device already seen or a new one
	#checkDevice = function(uuid, distance) {
		if(devices.some(device => device.uuid === uuid)) {
			this.#updateDevices(uuid, distance);	
		} else {
			this.#addDevice(uuid, distance);
		}
	}

	// Adds a new device to the list
	#addDevice = function(uuid, distance) {
		const deviceUuid = uuid;
		const deviceLastSeen = new Date().getHours() + ':' + new Date().getMinutes();
		const deviceLastDistance = distance;
		const device = { uuid: deviceUuid, lastSeen: deviceLastSeen, lastPosition: deviceLastDistance, roomNumber: roomNumber, raspberryId: raspberryId };

		devices.push(device);
		backend_mqtt.newDevice({ device: device });
		this.#writeToFile();
	}


	// Updates the last seen time of an already existing device
	#updateDevices = function(uuid, distance) {
		devices.forEach(device => {
			if(uuid === device.uuid) {
				device.lastSeen = new Date().getHours() + ':' + new Date().getMinutes();
				device.lastPosition = distance;
				device.roomNumber = roomNumber;
				device.raspberryId = raspberryId;
			}	
		});

		backend_mqtt.updateDevices({ devices: devices })
		this.#writeToFile();
	}

	#deleteDevices = function() {
		// It scans every minute every device seen so far and deletes the ones who has not been seen for 5 minutes or more
		setInterval(() => {
			devices.forEach(device => {
				console.log(`Scanned: ${device.uuid}`);
				var lastSeen = device.lastSeen.split(':');
				if(parseInt(lastSeen[0]) < new Date().getHours() || ((parseInt(lastSeen[0]) === new Date().getHours()) && (parseInt(lastSeen[1])+5 <= new Date().getMinutes()))) {
					// Deletes from position of the device to one position forward, aka the single device
					devices.splice(devices.indexOf(device), 1);
					backend_mqtt.deleteDevice({ device: device });
					this.#writeToFile();
				}
			});
		}, 60000);
	}

	// Writes changes to file
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

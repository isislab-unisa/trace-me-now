import root.settings as settings
import sys
import json
import paho.mqtt.client as paho
import bson.json_util as json_util
from flask import Flask
from flask import jsonify, request
from flask_pymongo import PyMongo
from root.api.mqtt.mqtt_routes import mqtt_client
from bson.json_util import dumps

app = Flask(__name__)

app.config['MONGO_URI'] = settings.MONGO_URI # 'mongodb://127.0.0.1:27017/globalStatus'
mongo = PyMongo(app)

def new_device(_json):
    _device = _json['device']

    if _device:
        _id = mongo.db.devices.insert({
            'uuid': _device['uuid'],
            'lastSeen': _device['lastSeen'],
            'lastPosition': _device['lastPosition'],
            'roomNumber': _device['roomNumber'],
            'raspberryId': _device['raspberryId']
        })

        print("Device added succesfully!")
        mqtt_client.publish("device/entered", dumps({"device": _device}))
        return True
    else:
        print("Error adding device!")
        return False

def update_devices(_json):
    _devices = _json['devices']

    for device in _devices:
        _uuid = device['uuid']
        _lastSeen = device['lastSeen']
        _lastPosition = device['lastPosition']
        _roomNumber = device['roomNumber']
        _raspberryId = device['raspberryId']

        query = {"uuid": _uuid}
        newvalues = { "$set": {
            'lastSeen': _lastSeen,
            'lastPosition': _lastPosition,
            'roomNumber': _roomNumber,
            'raspberryId': _raspberryId
        }}

        if _uuid and _lastSeen and _lastPosition and _roomNumber and _raspberryId:
            mongo.db.devices.update_one(query, newvalues)

            print("Devices updated successfully")

        else:
            return False
    
    return True

def delete_devices(_json):
    _devices = _json['devices']

    for device in _devices:
        _uuid = device['uuid']

        query = {"uuid": _uuid}

        if _uuid:
            mongo.db.devices.delete_one(query)
            mqtt_client.publish("device/left", dumps({"device": device}))
            print("Device deleted successfully")
        else:
            return False
    
    return True

def get_device_position(_json):
    _uuid = _json['uuid']

    device = mongo.db.devices.find_one({"uuid": _uuid}, {"uuid": 1, "lastSeen": 1, "lastPosition": 1, "roomNumber": 1, "raspberryId": 1})

    res = {"roomNumber": device["roomNumber"], "lastPosition": device["lastPosition"]}
    mqtt_client.publish("device/location", dumps(res))
    return res
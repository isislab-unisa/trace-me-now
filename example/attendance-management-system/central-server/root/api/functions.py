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

app.config['MONGO_URI'] = settings.MONGO_URI
mongo = PyMongo(app)

def new_device(_json):
    _device = _json['device']

    if _device:
        _id = mongo.db.devices.insert({
            'uuid': _device['uuid'],
            'lastSeen': _device['lastSeen'],
            'lastPosition': _device['lastPosition'],
            'roomNumber': _device['roomNumber'],
            'trackingNodeId': _device['trackingNodeId']
        })

        print("Device added succesfully!")
        mqtt_client.publish("notify/new", dumps({"device": _device}))
        return True
    else:
        print("Error adding device!")
        return False

def get_device(_json):
    _uuid = _json['uuid']

    device = mongo.db.devices.find_one({"uuid": _uuid}, {"uuid": 1, "lastSeen": 1, "lastPosition": 1, "roomNumber": 1, "trackingNodeId": 1})

    res = {"device": {"uuid": device["uuid"], "lastSeen": device["lastSeen"], "lastPosition": device["lastPosition"], "roomNumber": device["roomNumber"], "trackingNodeId": device["trackingNodeId"]}}
    
    return res

def get_device_position(_json):
    _uuid = _json['uuid']

    device = mongo.db.devices.find_one({"uuid": _uuid}, {"uuid": 1, "lastSeen": 1, "lastPosition": 1, "roomNumber": 1, "trackingNodeId": 1})

    res = {"roomNumber": device["roomNumber"], "lastPosition": device["lastPosition"]}
    mqtt_client.publish("notify/location/"+_uuid.upper(), dumps(res))
    return res

def update_devices(_json):
    _devices = _json['devices']

    for device in _devices:
        _uuid = device['uuid']
        _lastSeen = device['lastSeen']
        _lastPosition = device['lastPosition']
        _roomNumber = device['roomNumber']
        _trackingNodeId = device['trackingNodeId']

        res = {"roomNumber": _roomNumber, "lastPosition": _lastPosition}
        
        mqtt_client.publish("notify/position/"+_uuid.upper(), dumps(res))

        d = mongo.db.devices.find_one({"uuid": _uuid}, {"uuid": 1, "lastSeen": 1, "lastPosition": 1, "roomNumber": 1, "trackingNodeId": 1})
        
        if d["roomNumber"] != _roomNumber and d["trackingNodeId"] != _trackingNodeId:
            change = {
                "fromRoom": d["roomNumber"],
                "toRoom": _roomNumber,
                "fromtrackingNode": d["trackingNodeId"],
                "totrackingNode": _trackingNodeId
            }
            mqtt_client.publish("notify/change/"+_uuid.upper(), dumps(change))

        query = {"uuid": _uuid}
        newvalues = { "$set": {
            'lastSeen': _lastSeen,
            'lastPosition': _lastPosition,
            'roomNumber': _roomNumber,
            'trackingNodeId': _trackingNodeId
        }}

        if _uuid and _lastSeen and _lastPosition and _roomNumber and _trackingNodeId:
            mongo.db.devices.update_one(query, newvalues)

            print("Devices updated successfully")

        else:
            return False
    
    return True

def delete_device(_json):
    _device = _json['device']

    _uuid = _device['uuid']

    query = {"uuid": _uuid}

    if _uuid:
        mongo.db.devices.delete_many(query)
        mqtt_client.publish("notify/delete", dumps({"device": _device}))
        print("Device deleted successfully")

        return True
    else:
        return False

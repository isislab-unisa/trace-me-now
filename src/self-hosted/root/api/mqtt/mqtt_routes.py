import root.settings as settings
import sys
import json
import paho.mqtt.client as paho
import bson.json_util as json_util
from flask import Flask
from flask import jsonify, request
from flask_pymongo import PyMongo
from .. import functions
from types import FunctionType 
from bson.json_util import dumps
from bson.json_util import loads

events = []

def on_message(client, userdata, msg):
    _topic = msg.topic
    _message = msg.payload.decode()
    if _topic == "device/new":
        return functions.new_device(json.loads(_message))

    if _topic == "device/update":
        return functions.update_devices(json.loads(_message))

    if _topic == "device/delete":
        return functions.delete_devices(json.loads(_message))

    if _topic == "device/location":
        return functions.get_device_position(json.loads(_message))

    for event in events:
        if event['event'] == _topic:
            f_code = compile(event['function'], "<string>", "exec") 
            f_func = FunctionType(f_code.co_consts[0], globals(), "gfg") 
            
            value = f_func(_message)

            mqtt_client.publish(event['response'], json.loads(dumps(value)))


mqtt_client = paho.Client()
mqtt_client.on_message = on_message


def connect():
    if mqtt_client.connect(settings.MQTT_ADDRESS, settings.MQTT_PORT, settings.MQTT_TIMEOUT) != 0:
        print("Could not connect to MQTT Broker")
        print("Make sure mosquitto is running")
        print("     mosquitto -v")
        sys.exit(-1)

    mqtt_client.subscribe("device/new")
    mqtt_client.subscribe("device/update")
    mqtt_client.subscribe("device/delete")
    mqtt_client.subscribe("device/location")
    mqtt_client.loop_start()

def new_event(topic_event, topic_response, function):
    new_event = {"event": topic_event, "response": topic_response, "function": function}
    mqtt_client.subscribe(topic_event)
    events.append(new_event)
    #print(events)
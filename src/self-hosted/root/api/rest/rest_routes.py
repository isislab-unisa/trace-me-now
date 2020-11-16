import root.settings as settings
import json
import bson.json_util as json_util
from flask import Flask
from flask import jsonify, request
from flask_pymongo import PyMongo
from .. import functions
from bson.json_util import dumps
from bson.json_util import loads
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from .. import functions

app = Flask(__name__)

app.config['MONGO_URI'] = settings.MONGO_URI
mongo = PyMongo(app)

@app.route('/getDevices')
def get_devices():
    devices = mongo.db.devices.find()
    res = {"devices": json.loads(dumps(list(devices), indent = 1))}
    return res

@app.route('/getDevice/<uuid>')
def get_device(uuid):
    _json = {"uuid": uuid}
    res = functions.get_device(_json)
    return res

@app.route('/getDeviceLocation', methods=['POST'])
def get_device_position():
    _json = request.json
    res = functions.get_device_position(_json)
    if res:
        return res
    else:
        return not_found()

@app.route('/newDevice', methods=['POST'])
def new_device():
    _json = request.json
    if functions.new_device(_json):
        res = jsonify("Device added succesfully!")

        res.status_code = 200

        return res
    else:
        return not_found()
    

@app.route('/deleteDevices', methods=['POST'])
def delete_devices():
    _json = request.json
    if functions.delete_device(_json):
        res = jsonify("Device deleted succesfully!")

        res.status_code = 200

        return res
    else:
        return not_found()

@app.route('/updateDevices', methods=['POST'])
def update_devices():
    _json = request.json
    if functions.update_devices(_json):
        res = jsonify("Devices updated succesfully!")

        res.status_code = 200

        return res
    else:
        return not_found()

@app.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Not found' + request.url
    }
    res = jsonify(message)

    res.status_code = 404

    return res

def start():
    app.run(debug=True)
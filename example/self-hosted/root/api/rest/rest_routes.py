import root.settings as settings
import json
import bson.json_util as json_util
from flask import Flask
from flask_cors import CORS
from flask import jsonify, request
from flask_pymongo import PyMongo
from bson.json_util import dumps
from bson.json_util import loads
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from types import FunctionType 
from bson.json_util import dumps
from bson.json_util import loads
from .. import functions

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"Access-Control-Allow-Origin": "*"}})

app.config['MONGO_URI'] = settings.MONGO_URI
mongo = PyMongo(app)

routes = []

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
    return err()

# def start():
  #  app.run(debug=True)

def new_api(foo, path, method):
    new_route = {"foo": foo, "path": path, "method": method}
    routes.append(new_route)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def get_dir(path):
    for route in routes:
        print(route['path'])
        if route['path'] == path and route['method'] == 'GET':
            f_code = compile(route['foo'], "<string>", "exec") 
            f_func = FunctionType(f_code.co_consts[0], globals(), "gfg") 
            
            value = f_func(request.json)

            return value
        
    return err()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['POST'])
def post_dir(path):
    for route in routes:
        if route['path'] == path and route['method'] == 'POST':
            f_code = compile(route['foo'], "<string>", "exec") 
            f_func = FunctionType(f_code.co_consts[0], globals(), "gfg") 
            
            value = f_func(request.json)

            return value
 
    return err()

def err():
    message = {
        'status': 404,
        'message': 'Not found' + request.url
    }
    res = jsonify(message)

    res.status_code = 404

    return res
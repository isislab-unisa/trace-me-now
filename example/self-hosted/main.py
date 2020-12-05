import root.server as server

if __name__ == "__main__":

    foo = """
def register_employee(_json):
    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)

    mongodb.db.employees.insert({
            'uuid': _json['uuid'],
            'name': _json['name'],
            'startShift': _json['startShift'],
            'endShift': _json['endShift']
        })

    res = jsonify("Employee added succesfully!")
    res.status_code = 200

    return res
    """

    server.new_api(foo, 'newEmployee', 'POST')

    server.start_server_https()

    foo = """
def employee_arrives(_message):

    device = _message['device']

    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)

    employee = mongodb.db.employees.find_one({"uuid": device['uuid']}, {"uuid": 1, "name": 1, "startShift": 1, "endShift": 1})

    arrival = device['lastSeen'].split(':')
    startShift = employee['startShift'].split(':')

    if int(arrival[0]) > int(startShift[0]) or int(arrival[1]) > int(startShift[1]):
        inLate = True
    else:
        inLate = False

    arrives = {
        "uuid": employee['uuid'],
        "name": employee['name'],
        "startShift": employee['startShift'],
        "endShift": employee['endShift'],
        "arrivalTime": device['lastSeen'],
        "inLate": inLate
    }
    
    return dumps(arrives)
    """

    server.new_event('notify/new', 'employee/arrived', foo)

    foo = """
def employee_leaves(_message):
    device = _message['device']

    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)

    employee = mongodb.db.employees.find_one({"uuid": device['uuid']}, {"uuid": 1, "name": 1, "startShift": 1, "endShift": 1})

    departure = device['lastSeen'].split(':')
    startShift = employee['startShift'].split(':')
    endShift = employee['endShift'].split(':')

    if int(departure[0]) < int(endShift[0]) and int(departure[0]) >= int(startShift[0]) and int(departure[1]) >= int(startShift[1]):
        leftShift = True
    else:
        leftShift = False

    leaves = {
        "uuid": employee['uuid'],
        "name": employee['name'],
        "startShift": employee['startShift'],
        "endShift": employee['endShift'],
        "outgoingTime": device['lastSeen'],
        "leftShift": leftShift
    }

    return dumps(leaves)
    """

    server.new_event('notify/delete', 'employee/left', foo)

    foo = """
def employee_ask(_message):

    if _message['leftShift']:

        msg = "Your shift ends at {}. Wanna tell us where are you going at {}?".format(_message['endShift'], _message['outgoingTime'])

        message = {
            "message": msg
        }

        return dumps(message)
    """

    server.new_event('employee/left', 'employee/ask', foo)

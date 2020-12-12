import root.server as server

if __name__ == "__main__":

    get_employees = """
def get_employees(_json):
    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)
    
    employees = mongodb.db.employees.find()

    res = {"employees": json.loads(dumps(list(employees), indent = 1))}
    # res.status_code = 200

    return res
    """

    server.new_api(get_employees, 'getEmployees', 'GET')

    get_present_employees = """
def get_present_employees(_json):
    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)
    employees = []

    emps = mongodb.db.employees.find({"arrived": { "$ne": False }, "left": False})

    for emp in emps:
        arrival = emp['arrived'].split(':')
        startShift = emp['startShift'].split(':')

        if int(arrival[0]) > int(startShift[0]) or int(arrival[1]) > int(startShift[1]):
            inLate = True
        else:
            inLate = False

        employee = {
            "uuid": emp['uuid'],
            "name": emp['name'],
            "startShift": emp['startShift'],
            "endShift": emp['endShift'],
            "arrived": emp['arrived'],
            "left": emp['left'],
            "inLate": inLate
        }

        employees.append(employee)

    res = {"employees": json.loads(dumps(list(employees), indent = 1))}
    # res.status_code = 200

    return res
    """

    server.new_api(get_present_employees, 'getPresentEmployees', 'GET')

    register_employee = """
def register_employee(_json):
    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)

    mongodb.db.employees.insert({
            'uuid': _json['uuid'],
            'name': _json['name'],
            'startShift': _json['startShift'],
            'endShift': _json['endShift'],
            'arrived': False,
            'left': False
        })

    res = jsonify("Employee added succesfully!")
    res.status_code = 200

    return res
    """

    server.new_api(register_employee, 'newEmployee', 'POST')

    server.start_server()

    employee_arrives = """
def employee_arrives(_message):

    device = _message['device']

    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)

    mongodb.db.employees.update_one({"uuid": device['uuid']}, { "$set": {"arrived": device['lastSeen'], "left": False}})
    employee = mongodb.db.employees.find_one({"uuid": device['uuid']}, {"uuid": 1, "name": 1, "startShift": 1, "endShift": 1, "arrived": 1, "left": 1})

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
        "arrived": employee['arrived'],
        "left": employee['left'],
        "inLate": inLate
    }
    
    return dumps(arrives)
    """

    server.new_event('notify/new', 'employee/arrived', employee_arrives)

    employee_leaves = """
def employee_leaves(_message):
    device = _message['device']

    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://192.168.1.115:27017/employees"
    mongodb = PyMongo(pymongo)

    mongodb.db.employees.update_one({"uuid": device['uuid']}, { "$set": {"arrived": False, "left": device['lastSeen']}})
    employee = mongodb.db.employees.find_one({"uuid": device['uuid']}, {"uuid": 1, "name": 1, "startShift": 1, "endShift": 1, "arrived": 1, "left": 1})

    departure = employee['left'].split(':')
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
        "arrived": employee['arrived'],
        "left": employee['left'],
        "leftShift": leftShift
    }

    return dumps(leaves)
    """

    server.new_event('notify/delete', 'employee/left', employee_leaves)

    employee_ask = """
def employee_ask(_message):

    if _message['leftShift']:

        msg = "Your shift ends at {}. Wanna tell us where are you going at {}?".format(_message['endShift'], _message['outgoingTime'])

        message = {
            "uuid": _message['uuid'],
            "message": msg
        }

        return dumps(message)
    """

    server.new_event('employee/left', 'employee/ask', employee_ask)
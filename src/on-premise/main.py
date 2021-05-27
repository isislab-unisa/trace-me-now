import root.server as server

if __name__ == "__main__":
    foo = """
def get_function(_json):
    res = jsonify(_json)
    res.status_code = 200

    return res"""

    server.new_api(foo, 'getResponse', 'GET')

    foo = """
def post_function(_json):
    pymongo = Flask(__name__)

    pymongo.config['MONGO_URI'] = "mongodb://localhost:27017/newTable"
    mongo = PyMongo(pymongo)

    mongo.db.newCollection.insert({
            'newValue': _json['value']
        })

    res = jsonify("Value added succesfully!")
    res.status_code = 200

    return res"""

    server.new_api(foo, 'newValue', 'POST')

    server.start_server_https()

    foo = """
def new_event(_message):
    value = _message['value']

    return dumps(value)"""

    server.new_event('event/new', 'event/new/response', foo)
import root.settings as settings
import root.api.rest.rest_routes as rest
from root.api.rest.rest_routes import app
import root.api.mqtt.mqtt_routes as mqtt
from werkzeug.serving import run_simple 
import threading

def start_server():
    thread = threading.Thread(target = start_thread)
    thread.start()
    mqtt.connect()

def start_server_https():
    thread = threading.Thread(target = start_thread_https)
    thread.start()
    mqtt.connect()

def start_thread():
    app.run(host = settings.FLASK_ADDRESS, port = settings.FLASK_PORT)

def start_thread_https():
    app.run(host = settings.FLASK_ADDRESS, port = settings.FLASK_PORT, ssl_context=('/home/self-hosted/root/certs/cert.pem', '/home/self-hosted/root/certs/key.pem'))

def new_event(topic_event, topic_response, function):
    mqtt.new_event(topic_event, topic_response, function)

def new_api(foo, path, method):
    rest.new_api(foo, path, method)
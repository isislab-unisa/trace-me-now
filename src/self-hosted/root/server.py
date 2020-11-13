from root.api.rest.rest_routes import app
import root.api.mqtt.mqtt_routes as mqtt
from werkzeug.serving import run_simple 
import threading

def start_server():
    thread = threading.Thread(target = start_thread)
    thread.start()
    mqtt.connect()

def start_thread():
    app.run()

def new_event(topic_event, topic_response, function):
    mqtt.new_event(topic_event, topic_response, function)

'''
if __name__ == "__main__":
    start_server()
'''
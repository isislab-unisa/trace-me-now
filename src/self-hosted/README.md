# Self Hosted Server

This is a python module which lets you easily build your custom on-premise server, handling every event and notification, and managing the communication with a MongoDB NoSQL database - *i.e.*, keeping track of the global status of your system. All of the heavy lifting of managing everything is delegated to the framework itself, all you have to do is launch a new server, and create your custom triggers to events and notifications. Alright, let's start!

At first, you will need to install `docker` and `docker-compose`, for which it's highly recommended the official docker documentation. It will be used a docker-compose file which automates the deployment and allows you to easily satisfy the server dependencies. In fact, it will provide you with three containers: a container which will run a MongoDB service, another one for the Mosquitto service, and a third one that provides you with the environment to run your own server, without having to install all the needed dependencies.

Notice that the above is for information purposes only, you won't need to setup anything, instead, everything will be autoconfigured. Alright, let's start!

Clone the repository 

```bash
~$ git clone https://github.com/isislab-unisa/trace-me-now
```

or just download the `src/self-hosted/` folder.

Then you will need to move in the `docker-compose` folder, and only for the first time run the `inizialize.sh` script

```bash
~$ cd trace-me-now/src/self-hosted/docker/docker-compose/
~$ ./initialize.sh
```

This script will create a folder in your home path called `self-hosted`. This folder will be shared with the docker container equipped with the environment needed to run your own server. You will find in it a folder called `root/`, which contains the on-premise framework, and a file named `main.py`. You will start developing your server in this file, and you can even add as many files and directories as you want at the same level of the `root/` folder. Every change you apply to `/home/$USER/self-hosted/` will be applied on `/home/self-hosted/` in the container as well.

Notice that you may need to change the `root/settings.py` file with your custom configurations

```python
# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False

# MongoDB Settings
MONGO_URI = 'mongodb://<your host machine IP address>:27017/globalStatus'

# MQTT Settings
MQTT_ADDRESS = '<your host machine IP address>'
MQTT_PORT = 1883
MQTT_TIMEOUT = 60
```

Even though the MongoDB and Mosquitto services run in isolated containers, they will be seen from the external with the host machine IP address. So, replace `<your host machine IP address>` with your host machine IP address, so that your server will have access to them. Your server will be seen from the external with your host machine IP address as well, but if you want to access to it from the machine itself (for instance, to test the APIs), you will have to use the container IP address.

Now you can develop your server from your host machine with your favorite IDE, and when you're ready to launch or test it, you can launch the docker-compose file with

```bash
~$ docker-compose up
```

which will run MongoDB, Mosquitto, and your server environment in three different containers.

If you want to access to the server environment container bash, just run

```bash
~$ docker exec -it tracemenow-server bash
```

If you have a look to the `main.py` file you will find this

```python
import root.server as server

if __name__ == "__main__":
    server.start_server()
    
    foo = """def new_function(_message):
                // do some operation
                return some_value"""

    server.new_event("event/new", "event/response", foo)
```

It imports the framework with the name `server` and you can start your server by calling the `start_server()` method.

That's it! Your server is running and will handle all the default notifications and provide the APIs for you.

*If you want to know more about default notifications and APIs, please visit the dedicated sections.*

Now you can add your custom events and notifications, as many as you want. In order to do that, you can define a function to put in a string variable, using the python syntax. This function will define what to do everytime the event is triggered.

Then, by calling the `new_event()` method, you will create a new event to be triggered. The first parameter defines the topic where the event is generated, the second parameter defines the topic where a response is provided (such as a notification), and the third one is the function defined before, which defines the actions to take when the event is triggered.

Now you're ready to go! You can define as many new events as you want with so much simplicity, while still benefitting of the default events provided and managed by the framework itself!

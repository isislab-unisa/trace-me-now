# Central Server

The central server handling AMS runs over the TraceMeNow on-premise architecture. The component realizes the data collection, the communication with the boards and the smartphones, the registration phases and all the functionalities needed by the web interface. 
Whenever a new device is detected, the database is updated and accessed to check if the employee is late. On the other hand, when a badge is no longer within the workplace, the server controls if the work shift is finished and, if not, sends a notification to the smartphone asking for a reason.

The central server runs on a series of docker containers requiring Docker and docker-compose. The server includes an MQTT broker, a NoSQL database, and the Trace Me Now python server customized for the attendance management system.

## Run and test

![Docker-compose execution](../central-server/src/assets/screenshots/rounded-server-1.png)

The group of Docker containers can be started using docker-compose launching three different containers: a Mosquitto MQTT broker, a MongoDB server, and the Trace Me Now python server.

![Server execution](../central-server/src/assets/screenshots/rounded-server-2.png)

The central server can be run moving to the root folder and running

```bash
~$ docker-compose up
```
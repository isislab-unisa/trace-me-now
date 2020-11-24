FROM ubuntu:20.04

ENV TERM linux
ENV DEBIAN_FRONTEND noninteractive

RUN apt update -y
RUN apt upgrade -y

RUN apt install -y python3 python3-pip git vim net-tools

RUN pip3 install flask flask-sqlalchemy flask-restplus Werkzeug==0.16.1 jsonpickle Flask-PyMongo paho-mqtt Flask-Jsonpify pymongo flask_pymongo

RUN mkdir -p /home/self-hosted/

CMD ["/bin/bash", "python3 /home/self-hosted/main.py"]

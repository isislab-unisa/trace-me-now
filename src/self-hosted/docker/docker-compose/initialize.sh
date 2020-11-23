#!/bin/sh
path=$1
if [ -z "$path" ]; then
    echo "Please specify the path where you want to build your server as firt parameter"
    echo "Usage:    ./launch.sh /path/to/your/directory/"
else
    if [ ${path: -1} != "/" ]; then
        path="$path/"
    fi

    mkdir -p "${path}self-hosted/"
    git clone https://github.com/isislab-unisa/trace-me-now.git
    cp -R trace-me-now/src/self-hosted/root/ "${path}self-hosted/"
    rm -rf trace-me-now
    sudo docker-compose up &
    sudo docker run -t -d -P --name python-server -v "${path}self-hosted/":/home/self-hosted/ python-server:latest
    # sudo docker exec -it python-server bash
fi
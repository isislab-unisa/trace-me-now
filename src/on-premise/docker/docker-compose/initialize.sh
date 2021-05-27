#!/bin/sh
mkdir -p $HOME/on-premise/
git clone https://github.com/isislab-unisa/trace-me-now.git
cp -R trace-me-now/src/on-premise/root $HOME/on-premise/
cp -R trace-me-now/src/on-premise/main.py $HOME/on-premise/
cp docker-compose.yaml $HOME/on-premise/
rm -rf trace-me-now
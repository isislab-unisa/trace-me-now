#!/bin/sh
mkdir -p $HOME/self-hosted/
git clone https://github.com/isislab-unisa/trace-me-now.git
cp -R trace-me-now/src/self-hosted/root $HOME/self-hosted/
cp -R trace-me-now/src/self-hosted/main.py $HOME/self-hosted/
cp docker-compose.yaml $HOME/self-hosted/
rm -rf trace-me-now
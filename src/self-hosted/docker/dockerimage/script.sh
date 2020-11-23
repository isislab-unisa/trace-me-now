sudo docker container rm $(sudo docker container ls -aq)
sudo docker build -t python-server .
# sudo docker run --name python-server -i -t python-server
sudo docker run -t -d -P --name python-server -v /home/$USER/self-hosted/:/home/self-hosted/ python-server
sudo docker exec -it $(sudo docker ps -a -q) bash

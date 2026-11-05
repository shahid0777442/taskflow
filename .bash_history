groups
sudo usermod -aG docker ubuntu
exit
ssh -i C:\Users\<you>\Downloads\taskflow-key.pem ubuntu@52.204.240.23
sudo ssh -i C:\Users\<you>\Downloads\taskflow-key.pem ubuntu@52.204.240.23
cd ~/taskflow-src
ls
docker build -t taskflow:local ./app
IMAGE=taskflow:local docker compose -f docker-compose.prod.yml --env-file ~/taskflow/.env up -d
docker ps
sleep 10
curl http://localhost/health
exit

docker build . -t village_backend
docker run --add-host host.docker.internal:host-gateway -p 5000:5000 -t village_backend 
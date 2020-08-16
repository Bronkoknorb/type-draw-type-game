#!/bin/bash

# strict error handling
set -euxo pipefail

docker build --pull --tag tdt-game-build .

mkdir -p ./build/

# copy the built application out of the Docker image
# for that we first need to create a Docker container from the image
id=$(docker create tdt-game-build)
docker cp $id:/opt/tdt-src/build/libs/type-draw-type-server-1.0.0-SNAPSHOT.jar ./build/server.jar
# Now delete the temporary container again
docker rm -v $id

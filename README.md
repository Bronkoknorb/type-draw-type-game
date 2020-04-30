# Type Draw Type Game

TODO describe game

## Installation

Prerequisites:

- Install [Docker](https://www.docker.com/)

To build the app using Docker:

    docker build --tag draw .

To run the built Docker image (forwarding the internal port 8080 to the external port 8081):

    docker run -p 8081:8080 draw

You can then open the game on http://localhost:8081/

To run the Docker image (in the background) and do automatic restarts (e.g. when the machine gets rebooted or the application crashed):

    docker run -d --restart always --name draw -p 8081:8080 draw

To restart the Docker container after build a new version of the image:

    docker stop draw && docker rm draw && docker run -d --restart always --name draw -p 8081:8080 draw

To check the logs of the running Docker container:

    docker logs draw

## Development

### Backend Server

The Backend is developed using Spring Boot in Java and built with Gradle.

Prerequisites:

- Install Java (tested with version 11)

Run the server in development mode:

    cd tdt-server
    ./gradlew bootRun

See also [Spring-Boot-HELP.md](tdt-server/Spring-Boot-HELP.md).

### Frontend Web App

The Frontend is a React App written in Typescript and built with yarn.

Prerequisites:

- Install [yarn](https://yarnpkg.com/) (tested with version 1.22.4)

Run the frontend in development mode:

    cd tdt-webapp
    yarn start

This will also automatically start a proxy server which forwards API requests to the backend (running on port 8080).

To interactively upgrade dependencies of the frontend:

    yarn upgrade-interactive --latest

See also [React-App-HELP.md](tdt-webapp/React-App-HELP.md).

## Multi-Architecture build

I want to build ARM Docker images to run on my Raspberry Pi:

As of writing this, experimental features need to be enabled for Docker:

    export DOCKER_CLI_EXPERIMENTAL=enabled

Install qemu instructions to be able to build ARM executables:

    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

Create a multi-architecture build instance:

    docker buildx create --name mybuilder
    docker buildx use mybuilder
    docker buildx inspect --bootstrap

Build multi-architecture images:

    docker buildx build --platform linux/amd64,linux/arm/v7,linux/arm64 .

Reference: https://www.docker.com/blog/getting-started-with-docker-for-arm-on-linux/

## Author

Copyright by Hermann Czedik-Eysenberg  
git-dev@hermann.czedik.net

License: [GNU AFFERO GENERAL PUBLIC LICENSE](LICENSE)

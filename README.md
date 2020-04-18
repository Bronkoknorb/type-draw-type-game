Type Draw Type Game
===================

TODO describe game

Installation
------------

Prerequisites:
* Install [Docker](https://www.docker.com/)

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

Development
-----------

### Backend Server

The Backend is developed using Spring Boot in Java and built with Gradle.

Prerequisites:
* Install Java (tested with version 11)

Run the server in development mode:

    cd tdt-server
    ./gradlew bootRun

See also [Spring-Boot-HELP.md](tdt-server/Spring-Boot-HELP.md).

### Frontend Web App

The Frontend is a React App written in Typescript and built with yarn.

Prerequisites:
* Install [yarn](https://yarnpkg.com/) (tested with version 1.22.4)

Run the frontend in development mode:

    cd tdt-webapp
    yarn start

This will also automatically start a proxy server which forwards API requests to the backend (running on port 8080).

See also [React-App-HELP.md](tdt-webapp/React-App-HELP.md).

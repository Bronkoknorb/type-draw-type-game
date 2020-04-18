Type Draw Type Game
===================

TODO describe game

Installation
------------

To build the app using Docker:

    docker build --tag draw .

To run the built Docker image (forwarding the interal port 8080 to the external port 8081):

    docker run -p 8081:8080 draw

To run the Docker image (in the background) and do automatic restarts (e.g. when the machine gets rebooted or the application crashed):

    docker run -d --restart always --name draw -p 8081:8080 draw

To restart the Docker container after build a new version of the image:

    docker stop draw && docker rm draw && docker run -d --restart always --name draw -p 8081:8080 draw

To check the logs of the running Docker container:

    docker logs draw

Development
-----------

### Backend Server

The backend server is developed using Spring Boot in Java and built with Gradle.

Run the server in development mode:

    cd tdt-server
    ./gradlew bootRun

See also [Spring-Boot-HELP.md](tdt-server/Spring-Boot-HELP.md).

### Frontend Web App

The Frontend Web Application is a React App built with yarn (tested with yarn version 1.22.4).

Run the frontend in development mode:

    cd tdt-webapp
    yarn start

This will also automatically start a proxy server which forwards API requests to the backend (running on port 8080).

See also [React-App-HELP.md](tdt-webapp/React-App-HELP.md).

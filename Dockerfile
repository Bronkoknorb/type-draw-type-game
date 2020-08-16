# Stage 1 - build the webapp
FROM node:12.18.3-buster as build-webapp
WORKDIR /usr/src/app

# first copy only dependency definitions, because these change less often and therefore allow docker to cache the build results better
COPY tdt-webapp/package.json tdt-webapp/yarn.lock ./
RUN yarn --network-timeout 100000

COPY tdt-webapp/ ./
RUN yarn build

# Stage 2 - build the server
FROM ubuntu:18.04 as build-server
RUN apt-get update && apt-get install openjdk-11-jdk -y --no-install-recommends
WORKDIR /opt/tdt-src/

COPY tdt-server/gradle/ ./gradle/
COPY tdt-server/gradlew ./
# just to download the Gradle wrapper
RUN ./gradlew --version

# first copy only dependency definitions and main classes, because these change less often and therefore allow docker to cache the build results better
COPY tdt-server/build.gradle tdt-server/settings.gradle ./
COPY tdt-server/src/main/java/net/czedik/hermann/tdt/Application.java \
     ./src/main/java/net/czedik/hermann/tdt/Application.java
COPY tdt-server/src/test/java/net/czedik/hermann/tdt/ApplicationUnitTests.java \
     ./src/test/java/net/czedik/hermann/tdt/ApplicationUnitTests.java
RUN ./gradlew -i --no-daemon --build-cache --stacktrace build

# now copy everything
COPY tdt-server/ ./
# including the webapp resources generated in the stage 1
COPY --from=build-webapp /usr/src/app/build/ ./src/main/resources/public/
RUN ./gradlew -i --no-daemon --build-cache --stacktrace build

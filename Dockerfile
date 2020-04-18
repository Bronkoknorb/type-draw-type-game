# Stage 1 - build the webapp
FROM node:12.16.2-buster as build-webapp
WORKDIR /usr/src/app

# first copy only dependency definitions, because these change less often and therefore allow docker to cache the build results better
COPY tdt-webapp/package.json tdt-webapp/yarn.lock ./
RUN yarn

COPY tdt-webapp/ ./
RUN yarn build

# Stage 2 - build the server
FROM openjdk:11-jdk-slim-buster as build-server
WORKDIR /usr/src/server

COPY tdt-server/gradle/ ./gradle/
COPY tdt-server/gradlew ./
# just to download the Gradle wrapper
RUN ./gradlew --version

# first copy only dependency definitions and main classes, because these change less often and therefore allow docker to cache the build results better
COPY tdt-server/build.gradle tdt-server/settings.gradle ./
COPY tdt-server/src/main/java/net/czedik/hermann/tdt/Application.java ./src/main/java/net/czedik/hermann/tdt/Application.java
COPY tdt-server/src/test/java/net/czedik/hermann/tdt/ApplicationUnitTests.java ./src/test/java/net/czedik/hermann/tdt/ApplicationUnitTests.java
RUN ./gradlew -i --no-daemon --build-cache build

# now copy everything
COPY tdt-server/ ./
# including the webapp static resources generated in the stage 1
COPY --from=build-webapp /usr/src/app/build/ ./src/main/resources/static/
RUN ./gradlew -i --no-daemon --build-cache build

# Stage 3 - production container
FROM openjdk:11-jre-slim-buster
RUN useradd --user-group draw
USER draw:draw
WORKDIR /usr/src/server
COPY --from=build-server /usr/src/server/build/libs/type-draw-type-server-1.0.0-SNAPSHOT.jar server.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","server.jar"]

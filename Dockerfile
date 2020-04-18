# Stage 1 - build the webapp
FROM node:12.16.2-buster as build-webapp
WORKDIR /usr/src/app

# first copy only dependency definitions, because these change less often and therefore allow docker to cache the build results better
COPY tdt-webapp/package.json tdt-webapp/yarn.lock ./
RUN yarn

COPY tdt-webapp/ ./
RUN yarn build

# Stage 2 - the production environment
FROM nginx:1.16.1-alpine
COPY --from=build-webapp /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

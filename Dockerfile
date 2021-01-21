FROM node:10-alpine as builder

ENV WORKDIR /home/app
WORKDIR $WORKDIR

RUN apk update && apk add git yarn

COPY package.json .
COPY yarn.lock .

RUN yarn install --network-timeout 1000000

COPY . .

ARG VUE_APP_ROOT_API
ARG KEYCLOAK_URL
ARG KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_REALM

ENV VUE_APP_ROOT_API "${VUE_APP_ROOT_API}"
ENV KEYCLOAK_URL "${KEYCLOAK_URL}"
ENV KEYCLOAK_CLIENT_ID "${KEYCLOAK_CLIENT_ID}"
ENV KEYCLOAK_REALM "${KEYCLOAK_REALM}"

RUN yarn build

FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /home/app/dist /usr/share/nginx/html/connect
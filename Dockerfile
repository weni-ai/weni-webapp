FROM node:10-alpine as builder

ENV WORKDIR /home/app
WORKDIR $WORKDIR

RUN apk update && apk add git yarn

COPY package.json .
COPY yarn.lock .

RUN yarn install --network-timeout 1000000

COPY . .

ARG VUE_APP_ROOT_API

ENV VUE_APP_ROOT_API "${VUE_APP_ROOT_API}"

RUN yarn build

FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /home/app/dist /usr/share/nginx/html/connect
# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.18.0"
ARG BASE_VERSION="alpine3.17"

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /home/app

RUN apk --no-cache add git

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm NPM_CONFIG_CACHE=/root/.npm npm install

COPY . ./

RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx headers /usr/share/nginx/html/headers

COPY --from=builder --chown=nginx:nginx /home/app/dist /usr/share/nginx/html/connect/

COPY docker-entrypoint.sh file_handler.sh /

RUN mv /usr/share/nginx/html/connect/index.html /usr/share/nginx/html/connect/index.html.tmpl \
    && cd /usr/share/nginx/html/connect/ \
    && ln -s /tmp/index.html \
    && /file_handler.sh css

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

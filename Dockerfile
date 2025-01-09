# syntax = docker/dockerfile:1
ARG NODE_VERSION="18.19.1"
ARG BASE_VERSION="alpine3.19"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /home/app

RUN apk --no-cache add git

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm NPM_CONFIG_CACHE=/root/.npm npm install

COPY . ./

RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /home/app/dist /usr/share/nginx/html/connect/
COPY docker-entrypoint.sh /
RUN mv /usr/share/nginx/html/connect/index.html /usr/share/nginx/html/connect/index.html.tmpl \
    && cd /usr/share/nginx/html/connect/ \
    && ln -s /tmp/index.html

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

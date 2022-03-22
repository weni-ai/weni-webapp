FROM node:14-alpine as builder

ENV WORKDIR /home/app
WORKDIR $WORKDIR

RUN apk update && apk add git yarn

COPY package.json .
COPY yarn.lock .

RUN yarn install --network-timeout 1000000

COPY . .

RUN yarn build

FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /home/app/dist /usr/share/nginx/html/connect

COPY docker-entrypoint.sh /usr/share/nginx/

RUN chmod +x /usr/share/nginx/docker-entrypoint.sh

ENTRYPOINT ["/usr/share/nginx/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]

# COPY config.js.tmpl /usr/share/nginx/html/connect/

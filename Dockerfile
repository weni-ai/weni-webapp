# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.18.0"
ARG BASE_VERSION="alpine3.17"
ARG OLD_IMAGE="connectof/connect-webapp:latest"

# Add build arguments for env variables
ARG VERSION_NUMBER
ARG ROOT_API
ARG CHATS_API_URL
ARG BILLING_API_URL
ARG KEYCLOAK_ISSUER
ARG KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_REALM
ARG SENTRY_ENVIRONMENT
ARG HELPHERO
ARG STRIPE_API
ARG BOT_URL
ARG TWO_FA_APP_ANDROID
ARG TWO_FA_APP_IOS
ARG LOGROCKET_ID
ARG HOTJAR_ID
ARG FLOWS_GENERIC_TOKEN
ARG MODULES_YAML
ARG BRAIN_IS_SHOWN_FOR_PROJECTS
ARG BRAIN_IS_SHOWN_FOR_USERS
ARG BRAIN_IS_SHOWN_FOR_USER_MANAGED_PROJECTS_FROM
ARG NEXUS_API
ARG TEMP_COMMERCE_ALLOWED_EMAILS
ARG PROJECTS_BOTHUB_ALLOWED
ARG MODULE_FEDERATION_REMOTE_URL
ARG LOGROCKET_CHILD_DOMAINS
ARG SENTRY_DSN_ENDPOINT
ARG GITHUB_API
ARG GITHUB_CONTENT_API
ARG GITHUB_PLATFORM_UPDATES_REPOSITORY

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

# Add them again due to new build layer
ARG VERSION_NUMBER
ARG ROOT_API
ARG CHATS_API_URL
ARG BILLING_API_URL
ARG KEYCLOAK_ISSUER
ARG KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_REALM
ARG SENTRY_ENVIRONMENT
ARG HELPHERO
ARG STRIPE_API
ARG BOT_URL
ARG TWO_FA_APP_ANDROID
ARG TWO_FA_APP_IOS
ARG LOGROCKET_ID
ARG HOTJAR_ID
ARG FLOWS_GENERIC_TOKEN
ARG MODULES_YAML
ARG BRAIN_IS_SHOWN_FOR_PROJECTS
ARG BRAIN_IS_SHOWN_FOR_USERS
ARG BRAIN_IS_SHOWN_FOR_USER_MANAGED_PROJECTS_FROM
ARG NEXUS_API
ARG TEMP_COMMERCE_ALLOWED_EMAILS
ARG PROJECTS_BOTHUB_ALLOWED
ARG MODULE_FEDERATION_REMOTE_URL
ARG LOGROCKET_CHILD_DOMAINS
ARG SENTRY_DSN_ENDPOINT
ARG GITHUB_API
ARG GITHUB_CONTENT_API
ARG GITHUB_PLATFORM_UPDATES_REPOSITORY

WORKDIR /home/app

RUN apk --no-cache add git

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm NPM_CONFIG_CACHE=/root/.npm npm install

COPY . ./

RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

FROM ${OLD_IMAGE} AS old_css

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx headers /usr/share/nginx/html/headers

COPY --from=builder --chown=nginx:nginx /home/app/dist /usr/share/nginx/html/connect/
COPY --from=old_css --chown=nginx:nginx /usr/share/nginx/html/connect/assets/all.tx[t] /usr/share/nginx/html/connect/assets/*.css /usr/share/nginx/html/connect/assets/

COPY docker-entrypoint.sh file_handler.sh /

RUN cd /usr/share/nginx/html/connect/ \
    && /file_handler.sh css

COPY --from=builder --chown=nginx:nginx /home/app/dist /usr/share/nginx/html/connect/

RUN mv /usr/share/nginx/html/connect/index.html /usr/share/nginx/html/connect/index.html.tmpl \
    && cd /usr/share/nginx/html/connect/ \
    && ln -s /tmp/index.html

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

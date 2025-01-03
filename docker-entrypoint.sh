#!/bin/sh
export JSON_STRING='window.configs = { \
  "VITE_ROOT_API":"'${VITE_ROOT_API}'", \
  "VITE_KEYCLOAK_ISSUER":"'${VITE_KEYCLOAK_ISSUER}'", \
  "VITE_KEYCLOAK_CLIENT_ID":"'${VITE_KEYCLOAK_CLIENT_ID}'", \
  "VITE_KEYCLOAK_REALM":"'${VITE_KEYCLOAK_REALM}'", \
  "VITE_SENTRY_DSN_ENDPOINT":"'${VITE_SENTRY_DSN_ENDPOINT}'", \
  "VITE_HELPHERO":"'${VITE_HELPHERO}'", \
  "VITE_STRIPE_API":"'${VITE_STRIPE_API}'", \
  "VITE_BOT_URL":"'${VITE_BOT_URL}'", \
  "VITE_2FA_APP_ANDROID":"'${VITE_2FA_APP_ANDROID}'", \
  "VITE_2FA_APP_IOS":"'${VITE_2FA_APP_IOS}'", \
  "FLOWS_GENERIC_TOKEN":"'${FLOWS_GENERIC_TOKEN}'", \
  "MODULES_YAML":"'${MODULES_YAML}'", \
  "BRAIN_IS_SHOWN_FOR_PROJECTS":"'${BRAIN_IS_SHOWN_FOR_PROJECTS}'", \
  "BRAIN_IS_SHOWN_FOR_USERS":"'${BRAIN_IS_SHOWN_FOR_USERS}'", \
  "BRAIN_IS_SHOWN_FOR_USER_MANAGED_PROJECTS_FROM":"'${BRAIN_IS_SHOWN_FOR_USER_MANAGED_PROJECTS_FROM}'", \
  "NEXUS_API":"'${NEXUS_API}'", \
  "VITE_HOTJAR_ID":"'${VITE_HOTJAR_ID}'", \
  "VITE_BILLING_API_URL":"'${VITE_BILLING_API_URL}'", \
  "VITE_CHATS_API_URL":"'${VITE_CHATS_API_URL}'", \
  "GITHUB_API":"'${GITHUB_API}'", \
  "GITHUB_CONTENT_API":"'${GITHUB_CONTENT_API}'", \
  "GITHUB_PLATFORM_UPDATES_REPOSITORY":"'${GITHUB_PLATFORM_UPDATES_REPOSITORY}'", \
  "TEMP_COMMERCE_ALLOWED_EMAILS":"'${TEMP_COMMERCE_ALLOWED_EMAILS}'", \
}'
sed "s|\/\/CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/connect/index.html.tmpl > /tmp/index.html

exec "$@"

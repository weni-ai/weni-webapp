# connect

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Environment Variables

You can set environment variables in your OS or write on .env file.

| Variable | Type | Description |
|--|--|--|
| VUE_APP_ROOT_API | `string` | HTTP service API URL ( remember to pass "/" at the end)
| VUE_APP_HOTJAR_PROJECT_KEY | `string` | Hotjar project key
| KEYCLOAK_ISSUER | `string` | Keycloak base API
| KEYCLOAK_CLIENT_ID | `string` | Keycloak client ID
| KEYCLOAK_AUTHORIZATION_ENDPOINT | `string` | Keycloak authorization endpoint
| KEYCLOAK_USERINFO_ENDPOINT | `string` | Keycloak user info endpoint
| KEYCLOAK_END_SESSION_ENDPOINT | `string` | Keycloak end session endpoint
| KEYCLOAK_JWKS_URI | `string` | Keycloak Certs
| KEYCLOAK_TOKEN_ENDPOINT | `string` | Keycloak token endpoint
| KEYCLOAK_CHECK_SESSION_IFRAME | `string` | Keycloak check session iframe
| SENTRY_DSN_ENDPOINT | `string` | Sentry DSN

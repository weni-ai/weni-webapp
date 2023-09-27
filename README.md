# Connect

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

---

Connect is a project to unite the modules
[Weni Flows and Weni Studio](https://github.com/Ilhasoft/rapidpro),
[Weni Artificial Intelligence](https://github.com/Ilhasoft/bothub-webapp),
[Weni Integrations](https://github.com/Ilhasoft/weni-integrations-webapp)
and
[Weni Academy](https://github.com/Ilhasoft/weni-academy)
creating the [Weni Platform](https://dash.weni.ai/) through the microfrontends concept.

To contribute to this project, please see [our code of conduct and how to contribute](CONTRIBUTING.md).

## Install the dependencies
```
yarn install
```

## Compiles and hot-reloads for development
Before run locally the project, please set the [environment variables](#environment-variables).
```
yarn serve
```

## Compiles and minifies for production
```
yarn build
```

## Lints and fixes files
```
yarn lint
```

## Environment Variables

You can set environment variables in your OS or write on .env file.

| Variable | Type | Description |
|--|--|--|
| VUE_APP_ROOT_API | `string` | HTTP service API URL ( remember to pass "/" at the end)
| VUE_APP_SENTRY_DSN_ENDPOINT | `string` | Sentry DSN endpoint
| VUE_APP_HELPHERO | `string` | HelpHero identifier
| KEYCLOAK_ISSUER | `string` | Keycloak base API
| KEYCLOAK_CLIENT_ID | `string` | Keycloak client ID
| KEYCLOAK_REALM | `string` | Keycloak realm
| VUE_APP_STRIPE_API | `string` | Stripe API Token
| VUE_APP_URL_ACADEMY | `string` | Weni Academy URL
| LOGROCKET_ID | `string` | LogRocket ID
| LOGROCKET_CHILD_DOMAINS | `string` | LogRocket Child Domains separated with comma

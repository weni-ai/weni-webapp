import _ from 'lodash';
import keycloak from '../services/Keycloak';

const INVALID_SESSION_DETAILS = [
  "User session not found or doesn't have client attached on it",
  'Session expired',
];

/**
 * Sends the Keycloak bearer token on every request of the given axios instance.
 *
 * The header is omitted while there is no token, because `Bearer undefined`
 * reaches the backend as a malformed credential and comes back as a 401 that is
 * indistinguishable from an expired session.
 *
 * @param {import('axios').AxiosInstance} instance
 */
export function attachAuthorizationHeader(instance) {
  instance.interceptors.request.use((config) => {
    const token = keycloak?.keycloak?.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  });
}

/**
 * Logs the user out when the backend rejects their session.
 *
 * Only requests that actually carried a token are considered: an unauthenticated
 * request says nothing about the validity of the current session, so reacting to
 * its 401 would sign out a perfectly valid user.
 *
 * @param {import('axios').AxiosInstance} instance
 */
export function attachSessionExpirationHandler(instance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const isSessionInvalid =
        INVALID_SESSION_DETAILS.includes(
          _.get(error, 'response.data.detail'),
        ) || _.get(error, 'response.status') === 401;

      const wasAuthenticated = Boolean(
        _.get(error, 'config.headers.Authorization'),
      );

      if (isSessionInvalid && wasAuthenticated) {
        keycloak.keycloak.logout();
      }

      return Promise.reject(error);
    },
  );
}

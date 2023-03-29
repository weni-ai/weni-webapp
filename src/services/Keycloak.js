import Keycloak from 'keycloak-js';
import { pick, get } from 'lodash';
import getEnv from '../utils/env';

let keycloak = new Keycloak({
  url: getEnv('KEYCLOAK_ISSUER'),
  clientId: getEnv('KEYCLOAK_CLIENT_ID'),
  realm: getEnv('KEYCLOAK_REALM'),
});

keycloak.logout = () => {
  localStorage.removeItem('keycloak:user');
  window.location.replace(
    keycloak.createLogoutUrl() +
      '&client_id=' +
      encodeURIComponent(getEnv('KEYCLOAK_CLIENT_ID')) +
      '&id_token_hint=' +
      encodeURIComponent(keycloak.idToken),
  );
};

let hasInitialized = false;

export default {
  plugin: {
    install(Vue) {
      Vue.$keycloak = keycloak;
      Object.defineProperties(Vue.prototype, {
        $keycloak: {
          get() {
            return keycloak;
          },
        },
      });
    },
  },

  keycloak,

  async isAuthenticated() {
    if (hasInitialized) {
      return keycloak.authenticated;
    }

    let savedKeycloakUser = {};

    try {
      savedKeycloakUser = JSON.parse(localStorage.getItem('keycloak:user'));
    } catch (error) {
      console.log(error);
    }

    const toInsert = savedKeycloakUser?.token ? savedKeycloakUser : {};

    const authenticated = await keycloak.init({
      useNonce: false,
      scope: 'email profile openid offline_access',
      pkceMethod: 'S256',
      ...toInsert,
    });

    localStorage.setItem(
      'keycloak:user',
      JSON.stringify(
        pick(keycloak, [
          'token',
          'refreshToken',
          'idToken',
          'timeSkew',
          'responseMode',
          'flow',
        ]),
      ),
    );

    hasInitialized = true;

    setInterval(() => {
      keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            const intelligenceIframeWindow = get(
              document.querySelector('#intelligence'),
              'contentWindow',
            );

            if (intelligenceIframeWindow) {
              intelligenceIframeWindow.postMessage(
                `connect:updateExternalToken:${JSON.stringify({
                  data: { token: keycloak.token },
                })}`,
                '*',
              );
            }
          }
        })
        .catch(() => {
          console.error('Failed to refresh token');
        });
    }, 6000);

    return authenticated;
  },
};

import Keycloak from 'keycloak-js';
import { pick, get } from 'lodash';
import getEnv from '../utils/env';

let keycloak = new Keycloak({
  url: getEnv('VUE_APP_KEYCLOAK_ISSUER'),
  clientId: getEnv('VUE_APP_KEYCLOAK_CLIENT_ID'),
  realm: getEnv('VUE_APP_KEYCLOAK_REALM'),
});

const originalLogout = keycloak.logout;

keycloak.logout = () => {
  localStorage.removeItem('keycloak:user');
  originalLogout();
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

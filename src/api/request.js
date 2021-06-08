import _ from 'lodash';
import ApiInstance from './ApiInstance';

try {
  const user = JSON.parse(
    localStorage.getItem(
      `oidc.user:${process.env.VUE_APP_KEYCLOAK_ISSUER}:${process.env.VUE_APP_KEYCLOAK_CLIENT_ID}`
    )
  );

  ApiInstance.defaults.headers.common['Authorization'] = `Bearer ${user.access_token}`;
} catch(error) {
  console.log(error);
}

ApiInstance.interceptors.response.use((response) => {
  return response;
}, async function (error) {
  const detail = _.get(error, 'response.data.detail');

  if ([
    'User session not found or doesn\'t have client attached on it',
    'Session expired',
    'Token verification failed',
  ].includes(detail)) {
    localStorage.removeItem(
      `oidc.user:${process.env.VUE_APP_KEYCLOAK_ISSUER}:${process.env.VUE_APP_KEYCLOAK_CLIENT_ID}`
    );

    document.location.reload();
  }

  return Promise.reject(error);
});

export default {
  $http() {
    return ApiInstance;
  },
};

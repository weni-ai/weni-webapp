import _ from 'lodash';
import ApiInstance from './ApiInstance';
import keycloak from '../services/Keycloak';

ApiInstance.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${keycloak?.keycloak?.token}`;
  return config;
});

ApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const detail = _.get(error, 'response.data.detail');
    const status = _.get(error, 'response.status');

    if (
      [
        "User session not found or doesn't have client attached on it",
        'Session expired',
      ].includes(detail) ||
      status === 401
    ) {
      keycloak.keycloak.logout();
    }

    return Promise.reject(error);
  },
);

export default {
  $http() {
    return ApiInstance;
  },
};

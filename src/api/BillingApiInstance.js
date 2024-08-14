import getEnv from '../utils/env.js';
import axios from 'axios';
import keycloak from '../services/Keycloak';
import _ from 'lodash';

const billingHttp = axios.create({
  baseURL: getEnv('VITE_BILLING_API_URL') || '',
});

billingHttp.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${keycloak?.keycloak?.token}`;
  return config;
});

billingHttp.interceptors.response.use(
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

export default billingHttp;

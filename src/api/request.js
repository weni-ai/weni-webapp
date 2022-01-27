import _ from 'lodash';
import ApiInstance from './ApiInstance';
import SecurityService from '../services/SecurityService';

try {
  const user = JSON.parse(localStorage.getItem(SecurityService.userStoreKey));

  ApiInstance.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${user.access_token}`;
} catch (error) {
  console.log(error);
}

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
      SecurityService.signIn();
    }

    return Promise.reject(error);
  },
);

export default {
  $http() {
    return ApiInstance;
  },
};

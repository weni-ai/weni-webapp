import ApiInstance from './ApiInstance';
import {
  attachAuthorizationHeader,
  attachSessionExpirationHandler,
} from './interceptors';

attachAuthorizationHeader(ApiInstance);
attachSessionExpirationHandler(ApiInstance);

export default {
  $http() {
    return ApiInstance;
  },
};

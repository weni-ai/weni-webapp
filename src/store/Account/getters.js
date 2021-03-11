import LuigiClient from '@luigi-project/client';

export default {
  authToken() {
    return LuigiClient.getToken;
  },
};
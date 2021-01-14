import LuigiClient from '@luigi-project/client';

export default {
    getCurrentLanguage(state) {
      return state.currentLanguage;
    },
    authToken() {
      return LuigiClient.getToken();
    },
  };
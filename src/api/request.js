import axios from 'axios';
import store from '../store';

export default {
  $http(header = {}) {
    return axios.create({
      baseURL: process.env.VUE_APP_ROOT_API,
      headers: {
        ...(store.getters.authToken()
          ? { Authorization: `Bearer ${store.getters.authToken()}` } : {}),
        ...header,
      },
    });
  },
};
import axios from 'axios';

export default {
  $http(header = {}) {
    return axios.create({
      baseURL: process.env.VUE_APP_ROOT_API,
      headers: {
        ...header,
      },
    });
  },
};
import axios from 'axios';
export default {
  $http(baseURL, token, header = {}) {
    return axios.create({
      baseURL,
      headers: {
        ...header,
        ...(token
          ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};
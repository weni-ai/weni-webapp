import axios from 'axios';
export default {
  $http(baseURL, token) {
    console.log(token);
    return axios.create({
      baseURL,
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};
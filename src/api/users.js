import request from './request.js';

export default {
  search(search) {
    return request.$http().get(`/v1/account/search-user/?search=${search}`);
  },
};
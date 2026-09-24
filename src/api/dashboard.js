import request from './request.js';

export default {
  newsletterList(offset, limit) {
    return request
      .$http()
      .get(`/v1/dashboard/newsletter/?offset=${offset}&limit=${limit}`);
  },
};

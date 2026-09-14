import request from './request.js';

export default {
  async list({ projectUuid, cursor } = {}) {
    return request.$http().get(`/v2/projects/${projectUuid}/change-history`, {
      params: {
        cursor: cursor || undefined,
      },
    });
  },

  async retrieve({ projectUuid, uuid } = {}) {
    return request
      .$http()
      .get(`/v2/projects/${projectUuid}/change-history/${uuid}`);
  },
};

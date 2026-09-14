import { toApiFilters } from './adapters/changeHistory.js';
import request from './request.js';

export default {
  async list({ projectUuid, cursor, search, area, type } = {}) {
    return request.$http().get(`/v2/projects/${projectUuid}/change-history`, {
      params: {
        cursor: cursor || undefined,
        ...toApiFilters({ search, area, type }),
      },
    });
  },

  async retrieve({ projectUuid, uuid } = {}) {
    return request
      .$http()
      .get(`/v2/projects/${projectUuid}/change-history/${uuid}`);
  },
};

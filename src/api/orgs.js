import request from './request.js';

export default {
  list(offset, limit) {
    return request.$http().get(`/v1/organization/org/?offset=${offset}&limit=${limit}`);
  },

  createOrg(name, description) {
    return request.$http().post('/v1/organization/org/', {
            name,
            description,
        });
  },

  editOrg(uuid, name, description) {
    return request.$http().patch(`/v1/organization/org/${uuid}/`, {
      name,
      description,
    });
  },
  
  deleteOrg(uuid) {
    return request.$http().delete(`/v1/organization/org/${uuid}/`);
  },
};
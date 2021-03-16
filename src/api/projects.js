import request from './request.js';

export default {
  list(orgId, offset, limit) {
    return request.$http().get(`/v1/organization/project/?organization=${orgId}&offset=${offset}&limit=${limit}`);
  },

  externalList(token, orgId, offset, limit) {
    return request.$http({
      Authorization: `Bearer ${token}`
    }).get(`/v1/organization/project/?organization=${orgId}&offset=${offset}&limit=${limit}`);
  },

  createProject(name, organization, dateFormat) {
    return request.$http().post('/v1/organization/project/', {
            name,
            organization,
            "date_format": dateFormat,
        });
  },

  editOrg(uuid, name) {
    return request.$http().patch(`/v1/organization/project/${uuid}/`, {
      name,
    });
  },
  
  deleteProject(uuid) {
    return request.$http().delete(`/v1/organization/project/${uuid}/`);
  },
};
import request from './request.js';

export default {
  getProject({ uuid }) {
    return request.$http().get(`/v1/organization/project/${uuid}/`);
  },

  list(orgId, offset, limit, ordering) {
    return request.$http().get('/v1/organization/project/', {
      params: {
        organization: orgId,
        offset,
        limit,
        ordering,
      },
    });
  },

  externalList(token, orgId, offset, limit) {
    return request
      .$http()
      .get(
        `/v1/organization/project/?organization=${orgId}&offset=${offset}&limit=${limit}`,
      );
  },

  createProject(name, organization, dateFormat, timezone) {
    return request.$http().post('/v1/organization/project/', {
      name,
      organization,
      date_format: dateFormat,
      timezone,
    });
  },

  createReadyMadeProject(name, organization, dateFormat, timezone) {
    return request.$http().post('/v1/organization/template-project/', {
      name,
      organization,
      date_format: dateFormat,
      timezone,
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

  search(token, uuid, text) {
    return request
      .$http()
      .get(
        `/v1/organization/project/project_search/?project_uuid=${uuid}&text=${text}`,
      );
  },

  createProjectAuthorization({ email, projectUuid, role, chatRole }) {
    return request.$http().post('/v1/project/request-permission/', {
      email,
      project: projectUuid,
      role,
      rocket_authorization: chatRole,
    });
  },

  deleteProjectAuthorization({ email, projectUuid }) {
    return request
      .$http()
      .delete(
        `/v1/organization/project/grpc/destroy-user-permission/${projectUuid}/`,
        {
          data: {
            email,
          },
        },
      );
  },
};

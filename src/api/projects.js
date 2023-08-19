import axios from 'axios';
import request from './request.js';
import getEnv from '../utils/env.js';
import KCService from '../services/Keycloak.js';

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

  createReadyMadeProject(
    name,
    organization,
    dateFormat,
    timezone,
    template_type,
    globals,
  ) {
    return request.$http().post(`/v2/organizations/${organization}/projects/`, {
      name,
      date_format: dateFormat,
      timezone,
      template: template_type !== 'blank',
      template_type,
      globals,
    });
  },

  changeReadyMadeProjectProperties({ projectUuid, first_access }) {
    return request
      .$http()
      .patch(`/v1/organization/template-project/${projectUuid}/`, {
        first_access,
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

  createProjectAuthorization({ email, projectUuid, role, chatRole, hasChat }) {
    return request.$http().post('/v1/project/request-permission/', {
      email,
      project: projectUuid,
      role,
      [hasChat ? 'rocket_authorization' : 'chats_role']: chatRole,
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

  latestActivities({ projectUuid }) {
    return request.$http().get(`/v1/recent-activities?project=${projectUuid}`);
  },

  getTemplates() {
    return request.$http().get('v2/projects/template-type/');
  },

  async apiFlowsGetSuccessOrg({ flowUuid }) {
    const { data } = await axios.get(
      `${getEnv('MODULES_YAML').flows}api/v2/success_orgs/${flowUuid}`,
      {
        headers: {
          Authorization: `Bearer ${KCService.keycloak.token}`,
        },
      },
    );

    return data;
  },

  getOmieInfos(info, appKey, appSecret) {
    return request
      .$http()
      .get(`v2/omie/${info}?app_key=${appKey}&app_secret=${appSecret}`);
  },

  editProject(name, organization, projectUuid) {
    return request
      .$http()
      .patch(`/v2/organizations/${organization}/projects/${projectUuid}/`, {
        name,
      });
  },

  getWhatsAppDemoURL({ projectUuid }) {
    return request.$http().get('/v1/wpp-demo/url', {
      params: {
        project: projectUuid,
      },
    });
  },
};

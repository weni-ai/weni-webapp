import axios from 'axios';
import request from './request.js';
import getEnv from '../utils/env.js';
import KCService from '../services/Keycloak.js';
import { PROJECT_COMMERCE, PROJECT_GENERAL } from '../utils/constants.js';

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

  v2List({ params }) {
    return request.$http().get('/v1/organization/project/', {
      params,
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

  createReadyMadeProject({
    name,
    description,
    organization,
    dateFormat,
    timezone,
    templateUuid,
    globals,
    brainOn,
  }) {
    return request.$http().post(`/v2/organizations/${organization}/projects/`, {
      name,
      description,
      date_format: dateFormat,
      timezone,
      template: !!templateUuid,
      uuid: templateUuid,
      globals,
      brain_on: brainOn,
    });
  },

  getProjectsV2({ organizationUuid }) {
    return request
      .$http()
      .get(`/v2/organizations/${organizationUuid}/projects/`);
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

  latestActivities({ projectUuid, limit, next }) {
    return request.$http().get('/v2/recent-activities', {
      params: {
        cursor: next,
        project: projectUuid,
        page_size: limit,
      },
    });
  },

  getTemplates() {
    return request.$http().get('v2/projects/template-type/');
  },

  createTemplateSuggestion({ name, status = undefined }) {
    return request.$http().post('/v2/projects/template-suggestions/', {
      suggestion: name,
      status,
    });
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

  editProject(name, organization, projectUuid, timezone, description) {
    return request
      .$http()
      .patch(`/v2/organizations/${organization}/projects/${projectUuid}/`, {
        name,
        description,
        timezone,
      });
  },

  getWhatsAppDemoURL({ projectUuid }) {
    return axios.get(
      'https://integrations-engine.weni.ai/api/v1/apptypes/wpp-demo/apps/url/',
      {
        params: {
          project: projectUuid,
        },
        headers: {
          Authorization: 'Bearer ' + KCService.keycloak.token,
        },
      },
    );
  },

  updateTypeProject({ projectUuid, projectType }) {
    const type = {
      commerce: PROJECT_COMMERCE,
      general: PROJECT_GENERAL,
    };

    return request.$http().post(`/v1/projects/${projectUuid}/set-type`, {
      project_type: type[projectType] || type.general,
    });
  },

  updateModeProject({ projectUuid, projectMode }) {
    const type = {
      commerce: PROJECT_COMMERCE,
      general: PROJECT_GENERAL,
    };

    return request.$http().post(`/v2/projects/${projectUuid}/set-mode`, {
      project_mode: type[projectMode] || type.general,
    });
  },

  async updateProjectStatus({ projectUuid, status }) {
    return await request
      .$http()
      .patch(`/v1/organization/project/${projectUuid}/update_status/`, {
        status,
      });
  },
};

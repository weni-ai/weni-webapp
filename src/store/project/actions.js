import { captureException } from '@sentry/browser';
import projects from '../../api/projects';
import i18n from '../../utils/plugins/i18n';
import { unnnicCallAlert } from '@weni/unnnic-system';
import { fetchFlowOrganization } from '../org/actions';

export default {
  getCurrentProject() {
    const object = window.localStorage.getItem('project');
    if (object) return JSON.parse(object);
    return null;
  },

  getProject(store, { uuid }) {
    return projects.getProject({ uuid });
  },

  getProjects(store, { orgId, page = 1, limit = 20, ordering }) {
    const offset = limit * (page - 1);
    return projects.list(orgId, offset, limit, ordering);
  },

  async createProjectForOrg(
    {
      commit,
      rootState: {
        Org: {
          currentOrg: { uuid },
        },
      },
    },
    { project, onBack, onAccess },
  ) {
    commit('PROJECT_CREATE_REQUEST');
    try {
      let response = null;

      response = await projects.createReadyMadeProject(
        project.name,
        uuid,
        project.dateFormat,
        project.timeZone,
        project.format,
        project.globals,
      );

      let flowOrganization = response.data.flow_organization;

      if (!flowOrganization) {
        flowOrganization = await fetchFlowOrganization(response.data.uuid);
      }

      commit('PROJECT_CREATE_SUCCESS', {
        ...response.data,
        flow_organization: flowOrganization,
      });

      commit('OPEN_MODAL', {
        type: 'confirm',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: i18n.t('projects.create.confirm_title'),
          description: i18n.t('projects.create.confirm_subtitle'),
          cancelText: i18n.t('projects.create.view_projects'),
          confirmText: i18n.t('projects.create.go_to_project'),
          onClose: onBack,
          onConfirm: (justClose) => {
            justClose();
            onAccess(response.data.uuid);
          },
        },
      });
    } catch (e) {
      commit('PROJECT_CREATE_ERROR', e);
      unnnicCallAlert({
        props: {
          text: i18n.t('projects.create.error'),
          title: 'Error',
          icon: 'check-circle-1-1',
          scheme: 'feedback-red',
          position: 'bottom-right',
          closeText: i18n.t('close'),
        },
        seconds: 3,
      });

      captureException(new Error('PROJECT_CREATE', { cause: e }));
    }
  },

  async changeReadyMadeProjectProperties(
    { getters, commit },
    { projectUuid, first_access },
  ) {
    const { data } = await projects.changeReadyMadeProjectProperties({
      projectUuid,
      first_access,
    });

    commit('setCurrentProject', {
      ...getters.currentProject,
      first_access: data.first_access,
    });
  },

  editProject(store, { name, organization, projectUuid, timezone }) {
    return projects.editProject(name, organization, projectUuid, timezone);
  },

  deleteProject(store, { uuid }) {
    return projects.deleteProject(uuid);
  },

  setCurrentProject(
    { commit },
    {
      uuid,
      name,
      menu = {
        chat: [],
        flows: '',
        inteligence: '',
      },
      organization = {
        uuid: '',
      },
      flow_organization = {
        uuid: '',
        id: '',
      },
      first_access,
      flow_uuid,
      flow_count,
      project_type,
      authorization,
    } = {},
  ) {
    commit('setCurrentProject', {
      uuid,
      name,
      menu,
      organization,
      flow_organization,
      first_access,
      flow_uuid,
      flow_count,
      project_type,
      redirect_url: '',
      authorization,
    });
  },

  clearCurrentProject({ commit }) {
    commit('setCurrentProject', null);
  },

  async createOrUpdateProjectAuthorization(
    store,
    { email, projectUuid, role, chatRole, hasChat },
  ) {
    return projects.createProjectAuthorization({
      email,
      projectUuid,
      role,
      chatRole,
      hasChat,
    });
  },

  async removeProjectAuthorization(store, { email, projectUuid }) {
    return projects.deleteProjectAuthorization({
      email,
      projectUuid,
    });
  },

  async getSuccessOrgStatusByFlowUuid({ state, commit }, { flowUuid, force }) {
    try {
      if (!state.championChatbots[flowUuid] || force) {
        const { has_ia, has_flows, has_channel, has_msg } =
          await projects.apiFlowsGetSuccessOrg({ flowUuid });

        commit('setChampionChatbot', {
          flowUuid,
          has_ia,
          has_flows,
          has_channel,
          has_msg,
        });
      }

      return state.championChatbots[flowUuid];
    } catch (error) {
      commit('setChampionChatbot', {
        flowUuid,
        error: true,
      });

      throw error;
    }
  },
};

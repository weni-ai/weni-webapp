import projects from '../../api/projects';

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

  async createProject({
    commit,
    rootState: {
      BillingSteps: { project },
      Org: {
        currentOrg: { uuid },
      },
    },
  }) {
    commit('PROJECT_CREATE_REQUEST');
    try {
      const response = await projects.createProject(
        project.name,
        uuid,
        project.dateFormat,
        project.timeZone,
      );
      commit('PROJECT_CREATE_SUCCESS', response.data);
    } catch (e) {
      commit('PROJECT_CREATE_ERROR', e);
    }
  },

  editProject(store, { uuid, name }) {
    return projects.editProject(uuid, name);
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
    } = {},
  ) {
    commit('setCurrentProject', {
      uuid,
      name,
      menu,
      organization,
      flow_organization,
    });
  },

  clearCurrentProject({ commit }) {
    commit('setCurrentProject', null);
  },
};

import projects from '../../api/projects';

export default {
  getCurrentProject() {
    const object = window.localStorage.getItem('project');
    if (object) return JSON.parse(object);
    return null;
  },

  getProjects(store, { orgId, page = 1, limit = 20, ordering }) {
    const offset = limit * (page - 1);
    return projects.list(orgId, offset, limit, ordering);
  },

  createProject(store, { orgId, name, dateFormat, timezone }) {
    return projects.createProject(name, orgId, dateFormat, timezone);
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

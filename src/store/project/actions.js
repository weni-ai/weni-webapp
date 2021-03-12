import projects from '../../api/projects';

export default {
  retriveCurrentproject({ commit }) {
    if (window.localStorage) {
      commit('setCurrentProject', window.localStorage.getItem('project'));
    }
  },

  getProjects(store, {orgId, page = 1, limit = 20}) {
    const offset = limit*(page - 1);
    return projects.list(orgId, offset, limit);
  },

  createProject(store, { orgId, name, dateFormat }) {
    return projects.createProject(name, orgId, dateFormat);
  },

  editProject(store, { uuid, name }) {
    return projects.editProject(uuid, name);
  },

  deleteProject(store, { uuid }) {
    return projects.deleteProject(uuid);
  },
};
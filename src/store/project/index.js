import actions from './actions';

const state = {
  currentProject: null,
};

const getters = {
  currentProject(state) {
    return state.currentProject;
  },
};

const mutations = {
  setCurrentProject: (state, project) => (state.currentProject = project),
};

export default {
  state,
  getters,
  actions,
  mutations,
};

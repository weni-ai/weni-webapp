import actions from './actions';
import mutations from './mutations';

const state = {
  currentProject: null,
  loadingCreateProject: false,
  errorCreateProject: null,
  templates: {
    status: null,
    data: [],
  },
  championChatbots: {},
  projects: [],
};

const getters = {
  currentProject(state) {
    return state.currentProject;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

import Vue from 'vue';

export default {
  setCurrentProject: (state, project) => (state.currentProject = project),

  setChampionChatbot: (state, value) => {
    Vue.set(state, 'championChatbots', {
      ...state.setChampionChatbots,
      [value.flowUuid]: value,
    });
  },

  PROJECT_CREATE_REQUEST: (state) => (state.loadingCreateProject = true),
  PROJECT_CREATE_SUCCESS: (state, project) => {
    state.currentProject = project;
    state.loadingCreateProject = false;
  },
  PROJECT_CREATE_ERROR: (state, createProjectError) => {
    state.errorCreateProject = createProjectError;
    state.loadingCreateProject = false;
  },
};

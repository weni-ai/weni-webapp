import Vue from 'vue';
import store from '../../store';

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
    const projects = store.state.Project.projects.find(
      ({ orgUuid }) => orgUuid === project.organization,
    );

    if (projects) {
      projects.data.push(project);
    }

    state.currentProject = project;
    state.loadingCreateProject = false;
  },
  PROJECT_CREATE_ERROR: (state, createProjectError) => {
    state.errorCreateProject = createProjectError;
    state.loadingCreateProject = false;
  },
};

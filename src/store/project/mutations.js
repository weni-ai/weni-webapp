import store from '../../store';
import { useSharedStore } from '../Shared';

function setSharedCurrentProject(project) {
  useSharedStore().setCurrentProject(project);
}

export default {
  setCurrentProject: (state, project) => {
    state.currentProject = project;

    setSharedCurrentProject(project);
  },

  setChampionChatbot: (state, value) => {
    state.championChatbots = {
      ...state.championChatbots,
      [value.flowUuid]: value,
    };
  },

  setRecentActivities: (state, recentActivities) =>
    (state.recentActivities = recentActivities),

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

    setSharedCurrentProject(project);
  },
  PROJECT_CREATE_ERROR: (state, createProjectError) => {
    state.errorCreateProject = createProjectError;
    state.loadingCreateProject = false;
  },
};

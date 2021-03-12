export default {
    setCurrentProject(state, value) {
      state.currentProject = value;
      window.localStorage.setItem('project', value);
    }
  };
  
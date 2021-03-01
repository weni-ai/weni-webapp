export default {
    setCurrentOrgId(state, value) {
      state.currentOrgId = value;
      window.localStorage.setItem('org', value);
    }
  };
  
export default {
    setCurrentOrgId(state, value) {
      state.currentOrgId = value;
      if (!value) window.localStorage.removeItem('org');
      else window.localStorage.setItem('org', value);
    }
  };
  
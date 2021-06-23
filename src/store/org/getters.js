export default {
  getCurrentOrgId() {
    return () => {
      const org = window.localStorage.getItem('org');
      try {
        const orgObject = JSON.parse(org);
        return orgObject.uuid;
      } catch (e) {
        return null;
      }
    };
  },

  currentOrg(state) {
    return state.currentOrg;
  },
};

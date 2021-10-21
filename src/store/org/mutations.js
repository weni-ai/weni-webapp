export default {
  setCurrentOrg(state, organization) {
    state.currentOrg = organization;
  },

  ORG_CREATE_REQUEST: (state) => (state.loadingCreateOrg = true),
  ORG_CREATE_SUCCESS: (state, org) => {
    state.currentOrg = org;
    state.loadingCreateOrg = false;
  },
  ORG_CREATE_ERROR: (state, createOrgError) => {
    state.errorCreateOrg = createOrgError;
    state.loadingCreateOrg = false;
  },
};

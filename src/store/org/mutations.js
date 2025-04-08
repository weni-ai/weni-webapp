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

  updateOrgsList(state, orgs) {
    state.orgs.data = orgs;
  },

  updateOrgAuthorizations(state, { orgUuid, authorizations }) {
    const orgIndex = state.orgs.data.findIndex((org) => org.uuid === orgUuid);

    if (orgIndex !== -1) {
      const updatedOrg = {
        ...state.orgs.data[orgIndex],
        authorizations,
      };

      state.orgs.data = [
        ...state.orgs.data.slice(0, orgIndex),
        updatedOrg,
        ...state.orgs.data.slice(orgIndex + 1),
      ];
    }
  },
};

import app from '../../main';

export default {
  currentOrg(state) {
    return state.currentOrg;
  },

  org() {
    let orgUuid;

    if (app.$route.params.projectUuid) {
      orgUuid = app.$store.state.Project.currentProject.organization;
    } else {
      orgUuid = app.$route.params.orgUuid;
    }

    return app.$store.state.Org.orgs.data.find(({ uuid }) => uuid === orgUuid);
  },
};

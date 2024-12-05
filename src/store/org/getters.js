import router from '@/router'; // Importa o router diretamente
import store from '@/store';

export default {
  currentOrg(state) {
    return state.currentOrg;
  },

  org() {
    let orgUuid;

    if (router.currentRoute.value.params.projectUuid) {
      orgUuid = store.state.Project.currentProject.organization;
    } else {
      orgUuid = router.currentRoute.value.params.orgUuid;
    }

    return store.state.Org.orgs.data.find(({ uuid }) => uuid === orgUuid);
  },
};

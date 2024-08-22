import orgs from '../../api/orgs';
import projects from '../../api/projects';

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function fetchFlowOrganization(projectUuid) {
  const { data: project } = await projects.getProject({ uuid: projectUuid });

  if (project.flow_organization) {
    return project.flow_organization;
  } else {
    sleep(3);

    return await fetchFlowOrganization(projectUuid);
  }
}

export default {
  getOrgs(store, { page = 1, limit = 20 }) {
    const offset = limit * (page - 1);
    return orgs.list(offset, limit);
  },

  async getNextOrgs({ rootState: { Org } }) {
    Org.orgs.status = 'loading';

    const ordering = {
      alphabetical: 'name',
      newer: '-created_at',
      older: 'created_at',
    }[Org.orgs.ordering];

    const {
      data: { results, next },
    } = await orgs.list({
      next: Org.orgs.next,
      ordering,
    });

    Org.orgs.next = next;

    Org.orgs.status = null;

    Org.orgs.data = [
      ...Org.orgs.data,
      ...results.filter(({ uuid: organizationUuid }) => {
        return !Org.orgs.data.some(({ uuid }) => organizationUuid === uuid);
      }),
    ];

    Org.orgs.status = next == null ? 'complete' : null;
  },

  getOrg(store, { uuid }) {
    return orgs.getOrg({ uuid });
  },

  editOrg(store, { uuid, name, description }) {
    return orgs.editOrg(uuid, name, description);
  },

  deleteOrg(store, { uuid }) {
    return orgs.deleteOrg(uuid);
  },

  getMembers(store, { uuid, page = 1, limit = 20, search }) {
    const offset = limit * (page - 1);
    return orgs.getMembers(uuid, offset, limit, search);
  },

  createRequestPermission(store, data) {
    return orgs.createRequestPermission(data);
  },

  addAuthorization(store, { orgId, username, role }) {
    return orgs.addAuthorization(orgId, username, role);
  },

  removeAuthorization(store, { orgId, username }) {
    return orgs.removeAuthorization(orgId, username);
  },

  changeAuthorization(store, { orgId, username, role }) {
    return orgs.changeAuthorization(orgId, username, role);
  },

  leaveOrg(store, { orgId, id }) {
    return orgs.leaveOrg(orgId, id);
  },

  setCurrentOrg(
    { commit },
    {
      name,
      uuid,
      inteligence_organization,
      authorization,
      organization_billing,
      extra_integration,
      enforce_2fa,
      is_suspended,
    } = {},
  ) {
    commit('setCurrentOrg', {
      name,
      uuid,
      inteligence_organization,
      authorization,
      organization_billing,
      extra_integration,
      enforce_2fa,
      is_suspended,
    });
  },

  clearCurrentOrg({ commit }) {
    commit('setCurrentOrg', null);
  },
};

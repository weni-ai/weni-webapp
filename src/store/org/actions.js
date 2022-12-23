import orgs from '../../api/orgs';

export default {
  getOrgs(store, { page = 1, limit = 20 }) {
    const offset = limit * (page - 1);
    return orgs.list(offset, limit);
  },

  async getNextOrgs({ rootState: { Org } }) {
    const offset = Org.orgs.limit * (Org.orgs.page - 1);

    Org.orgs.status = 'loading';

    const {
      data: { results, next },
    } = await orgs.list(offset, Org.orgs.limit);

    Org.orgs.status = null;

    Org.orgs.page = Org.orgs.page + 1;

    Org.orgs.data = [
      ...Org.orgs.data,
      ...results.filter(({ uuid: organizationUuid }) => {
        return !Org.orgs.data.some(({ uuid }) => organizationUuid === uuid);
      }),
    ];

    Org.orgs.status = next == null ? 'complete' : null;
  },

  async createOrg(
    {
      commit,
      rootState: {
        BillingSteps: { org, project },
        Org,
      },
    },
    { type, authorizations },
  ) {
    commit('ORG_CREATE_REQUEST');

    const template = ['lead-capture', 'support'].includes(project.format);

    try {
      const response = await orgs.createOrg(
        org.name,
        org.description,
        type,
        authorizations,
        {
          date_format: project.dateFormat,
          name: project.name,
          timezone: project.timeZone,
          template,
          template_type: {
            'lead-capture': 'lead_capture',
            support: 'support',
          }[project.format],
        },
      );

      commit('ORG_CREATE_SUCCESS', response.data.organization);

      Org.orgs.data.push(response.data.organization);

      commit('PROJECT_CREATE_SUCCESS', response.data.project);
    } catch (e) {
      commit('ORG_CREATE_ERROR', e);
      commit('OPEN_MODAL', {});
    }
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
    });
  },

  clearCurrentOrg({ commit }) {
    commit('setCurrentOrg', null);
  },
};

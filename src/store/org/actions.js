import orgs from '../../api/orgs';

export default {
  getOrgs(store, { page = 1, limit = 20 }) {
    const offset = limit * (page - 1);
    return orgs.list(offset, limit);
  },

  createOrg(store, { name, description }) {
    return orgs.createOrg(name, description);
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

  addAuthorization(store, { orgId, username, role }) {
    return orgs.addAuthorization(orgId, username, role);
  },

  removeAuthorization(store, { orgId, username }) {
    return orgs.removeAuthorization(orgId, username);
  },

  changeAuthorization(store, { orgId, username, role }) {
    return orgs.changeAuthorization(orgId, username, role);
  },

  leaveOrg(store, { orgId, username }) {
    return orgs.leaveOrg(orgId, username);
  },

  setCurrentOrg(
    { commit },
    { name, uuid, inteligence_organization, authorization } = {},
  ) {
    commit('setCurrentOrg', {
      name,
      uuid,
      inteligence_organization,
      authorization,
    });
  },

  clearCurrentOrg({ commit }) {
    commit('setCurrentOrg', null);
  },
};

import orgs from '../../api/orgs'

export default {
  retriveCurrentOrgId({ commit }) {
    if (window.localStorage) {
      commit('setCurrentOrgId', window.localStorage.getItem('org'));
    }
  },

  getOrgs(store, {page = 1, limit = 20}) {
    const offset = limit*(page - 1);
    return orgs.list(offset, limit)
  },

  createOrg(store, { name, description }) {
    console.log({ name, description })
    return orgs.createOrg(name, description)
  },

  editOrg(store, { uuid, name, description }) {
    return orgs.editOrg(uuid, name, description)
  },

  deleteOrg(store, { uuid }) {
    return orgs.deleteOrg(uuid);
  },

  getMembers(store, { uuid, page = 1, limit = 20 }) {
    const offset = limit*(page - 1);
    return orgs.getMembers(uuid, offset, limit);
  },

  addAuthorization(store, { orgId, username, role }) {
    return orgs.addAuthorization(orgId, username, role);
  },

  removeAuthorization(store, { orgId, username }) {
    return orgs.removeAuthorization(orgId, username);
  },

  changeAuthorization(store, { orgId, username, role }) {
    return orgs.changeAuthorization(orgId, username, role)
  },
};
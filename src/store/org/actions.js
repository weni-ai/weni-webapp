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

  editOrg(store, { name, description }) {
    return orgs.editOrg(name, description)
  },

  deleteOrg(store, { uuid }) {
    return orgs.deleteOrg(uuid);
  }
};
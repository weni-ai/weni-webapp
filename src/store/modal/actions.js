import _ from 'lodash';

export default {
  async openModal({ commit, state }, data) {
    _.extend(data, { id: ++state.lastId });

    commit('OPEN_MODAL', data);

    return data.id;
  },

  async closeModal({ commit }, id) {
    commit('CLOSE_MODAL', id);
  },
};

import { extend } from 'lodash';

const state = {
  lastInsertedId: 0,
  all: [],
};

const getters = {};

const actions = {
  openRightBar({ commit, state }, data) {
    extend(data, { id: ++state.lastInsertedId });

    console.log(data);

    commit('OPEN_RIGHT_BAR', data);

    return data.id;
  },

  async closeRightBar({ commit }, id) {
    commit('CLOSE_RIGHT_BAR', id);
  },
};

const mutations = {
  OPEN_RIGHT_BAR: (state, data) => {
    state.all.push(data);
  },

  CLOSE_RIGHT_BAR: (state, id) => {
    state.all = state.all.filter((rightBar) => rightBar.id !== id);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

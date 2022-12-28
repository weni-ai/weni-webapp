import dashboard from '../../api/dashboard';

const state = {
  all: [],
  lastViewedNews: Number(localStorage.getItem('lastViewedNews')) || 0,
};

const getters = {};

const actions = {
  loadNews({ state }) {
    dashboard.newsletterList(0, 40).then((response) => {
      state.all = response.data.results.reverse();
    });
  },
};

const mutations = {};

export default {
  state,
  getters,
  actions,
  mutations,
};

import dashboard from '../../api/dashboard';

const state = {
  status: null,
  all: [],
  lastViewedNews: Number(localStorage.getItem('lastViewedNews')) || 0,
};

const getters = {};

const actions = {
  loadNews({ state }) {
    state.status = 'loading';
    dashboard.newsletterList(0, 40).then((response) => {
      state.status = 'loaded';
      state.all = (response.data?.results || response.data).reverse();
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

export default {
  state: {
    name: '',
    goal: '',

    content: {
      text: '',
      files: [],
      sites: [],
    },
  },

  getters: {},
  actions: {},
  mutations: {
    brainFormReset(state) {
      state.name = '';
      state.goal = '';

      state.content.text = '';
      state.content.files = [];
      state.content.sites = [];
    },
  },
};

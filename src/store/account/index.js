import actions from './actions';
import mutations from './mutations';

const state = {
  loading: true,
  profile: null,
  loadingUpdate: null,

  additionalInformation: {
    status: null,
    data: {},
  },
};

const getters = {
  user(state) {
    return state.profile;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

import actions from './actions';
import mutations from './mutations';

const state = {
  loading: null,
  profile: null,
  loadingUpdate: null,
  initialInfoLoading: null,
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

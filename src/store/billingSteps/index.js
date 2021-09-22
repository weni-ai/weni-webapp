import state from './state';
import actions from './actions';
import mutations from './mutations';

const getters = {
  getPaidPrice: (state) => {
    return 1200 + 899 * Number(state.integrations);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};

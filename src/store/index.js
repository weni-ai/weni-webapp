import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

import Account from './account';
import Dashboard from './dashboard';
import Org from './org';
import Users from './users';
import Project from './project';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  key: 'store',
});

const store = new Vuex.Store({
  modules: {
    Dashboard,
    Org,
    Account,
    Users,
    Project,
  },
  plugins: [vuexLocal.plugin],
});

store.state.Account.profile = null;

if (process.env.NODE_ENV === 'development') {
  store.subscribeAction({
    after: (action, state) => {
      console.log(`[ACTION]: ${action.type}`);
      console.log(`[NEW STATE]:`, state);
    },
  });
}

export default store;

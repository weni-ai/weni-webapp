import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import Account from './account';
import Dashboard from './dashboard';
import Org from './org';
import Users from './users';
import Project from './project';
import Modal from './modal';
import BillingSteps from './billingSteps';

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
    Modal,
    BillingSteps,
  },
  plugins: [vuexLocal.plugin],
});

store.state.Account.profile = null;

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

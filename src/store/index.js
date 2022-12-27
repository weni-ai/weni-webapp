import Vue from 'vue';
import Vuex from 'vuex';
// import VuexPersistence from 'vuex-persist';
import Account from './account';
import Dashboard from './dashboard';
import Org from './org';
import Billing from './billing';
import Users from './users';
import Project from './project';
import Modal from './modal';
import BillingSteps from './billingSteps';
import RightBar from './RightBar';

Vue.use(Vuex);

// const vuexLocal = new VuexPersistence({
//   storage: window.localStorage,
//   key: 'store',
// });

const store = new Vuex.Store({
  modules: {
    Dashboard,
    Org,
    Billing,
    Account,
    Users,
    Project,
    Modal,
    BillingSteps,
    RightBar,
  },
  // plugins: [vuexLocal.plugin],
});

store.state.Account.profile = null;

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

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
import News from './News';
import Brain from './Brain';

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
    News,
    Brain,
    Theme: {
      state: () => ({ name: 'light' }),
    },
  },
  // plugins: [vuexLocal.plugin],
});

if (localStorage.getItem('theme')) {
  store.state.Theme.name = localStorage.getItem('theme');

  document.body.setAttribute('unnnic-theme', store.state.Theme.name);
}

store.state.Account.profile = null;

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

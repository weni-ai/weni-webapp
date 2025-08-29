import { createStore } from 'vuex';
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
import { moduleStorage } from '../utils/moduleStorage';

const store = createStore({
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
});

if (moduleStorage.getItem('theme')) {
  store.state.Theme.name = moduleStorage.getItem('theme');

  document.body.setAttribute('unnnic-theme', store.state.Theme.name);
}

store.state.Account.profile = null;

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

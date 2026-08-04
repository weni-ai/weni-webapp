import { createStore } from 'vuex';
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

const store = createStore({
  modules: {
    Dashboard,
    Org,
    Billing,
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

if (localStorage.getItem('theme')) {
  store.state.Theme.name = localStorage.getItem('theme');

  document.body.setAttribute('unnnic-theme', store.state.Theme.name);
}

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

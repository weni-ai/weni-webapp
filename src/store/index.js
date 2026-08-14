import { createStore } from 'vuex';
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
    Org,
    Billing,
    Users,
    Project,
    Modal,
    BillingSteps,
    RightBar,
    News,
    Brain,
  },
});

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

import { createStore } from 'vuex';
import Org from './org';
import Billing from './billing';
import Project from './project';
import Modal from './modal';
import BillingSteps from './billingSteps';
import RightBar from './RightBar';

const store = createStore({
  modules: {
    Org,
    Billing,
    Project,
    Modal,
    BillingSteps,
    RightBar,
  },
});

store.state.Modal.lastId = 0;
store.state.Modal.actives = [];

export default store;

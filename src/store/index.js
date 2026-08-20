import { createStore } from 'vuex';
import Org from './org';
import Billing from './billing';
import Project from './project';
import BillingSteps from './billingSteps';

const store = createStore({
  modules: {
    Org,
    Billing,
    Project,
    BillingSteps,
  },
});

export default store;

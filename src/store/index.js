import { createStore } from 'vuex';
import Org from './org';
import Project from './project';
import BillingSteps from './billingSteps';

const store = createStore({
  modules: {
    Org,
    Project,
    BillingSteps,
  },
});

export default store;

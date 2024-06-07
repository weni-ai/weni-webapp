import { shallowMount, createLocalVue } from '@vue/test-utils';
import Card from '@/components/billing/Card.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import Router from 'vue-router';

import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

let wrapper;

let actions;
let store;
let getters;
let state;

actions = {
  removeIntegration: jest.fn(),
  addIntegration: jest.fn(),
};
state = {
  BillingSteps: {
    integrations: '1',
    pricing: {
      status: null,
      plans: ['trial'],
    },
  },
};
getters = {
  currentOrg() {
    return org;
  },
};
store = new Vuex.Store({
  actions,
  getters,
  state,
});
wrapper = shallowMount(Card, {
  localVue,
  i18n,
  router,
  store,
  mocks: {
    $t: () => 'some specific text',
  },
  stubs: {
    unnnicIconSvg: true,
    unnnicToolTip: true,
    unnnicButton: true,
    unnnicSwitch: true,
    unnnicInput: true,
  },
  propsData: {
    type: 'trial',
  },
});

describe('Card.vue', () => {
  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

import { vi } from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Card from '@/components/billing/Card.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import Router from 'vue-router';

import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

vi.mock('@/api/orgs.js', () => ({
  default: {
    plansPricing: vi.fn(async () => ({
      data: [],
    })),
  },
}));

const router = new Router();

let wrapper;

let actions;
let store;
let getters;
let state;

actions = {
  removeIntegration: vi.fn(),
  addIntegration: vi.fn(),
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
    UnnnicIconSvg: true,
    UnnnicIcon: true,
    UnnnicToolTip: true,
    UnnnicButton: true,
    UnnnicSwitch: true,
    UnnnicInput: true,
  },
  props {
    type: 'trial',
  },
});

describe('Card.vue', () => {
  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

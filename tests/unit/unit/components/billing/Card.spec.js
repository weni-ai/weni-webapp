import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Card from '@/components/billing/Card.vue';

import { createStore } from 'vuex';

import { org } from '../../../__mocks__';

vi.mock('@/api/orgs.js', () => ({
  default: {
    plansPricing: vi.fn(async () => ({
      data: [],
    })),
  },
}));

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
      status: 'loaded',
      plans: {
        trial: {
          limit: 250,
          price: 0,
        },
      },
    },
  },
};
getters = {
  currentOrg() {
    return org;
  },
};
store = createStore({
  actions,
  getters,
  state,
});
wrapper = shallowMount(Card, {
  global: {
    plugins: [store],
    stubs: {
      UnnnicIconSvg: true,
      UnnnicIcon: true,
      UnnnicToolTip: true,
      UnnnicButton: true,
      UnnnicSwitch: true,
      UnnnicInput: true,
    },
  },
  props: {
    type: 'trial',
  },
});

describe('Card.vue', () => {
  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

import { shallowMount, createLocalVue } from '@vue/test-utils';
import WarningMaxActiveContacts from '@/components/billing/WarningMaxActiveContacts.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import Router from 'vue-router';

import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('WarningMaxActiveContacts.vue', () => {
  let wrapper;

  let actions;
  let store;
  let getters;
  let state;

  beforeEach(() => {
    actions = {
      organizationLimit: () => {
        return {
          data: {},
        };
      },
      setBillingStep: jest.fn(),
      getOrg: jest.fn(),
      setCurrentOrg: jest.fn(),
    };
    state = {
      BillingSteps: {
        billing_details: {
          address: {
            country: 'BR',
            state: 'AL',
          },
        },
      },
      News: {
        status: null,
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
    wrapper = shallowMount(WarningMaxActiveContacts, {
      localVue,
      i18n,
      propsData: {
        ranges: [],
      },
      router,
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        unnnicIconSvg: true,
        unnnicSlider: true,
        unnnicTable: true,
        unnnicTableRow: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

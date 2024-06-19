import { shallowMount, createLocalVue } from '@vue/test-utils';
import FormCreditCard from '@/views/billing/plans/FormCreditCard.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);

describe('FormCreditCard.vue', () => {
  let wrapper;

  let actions;
  let store;
  let getters;
  let state;

  beforeEach(() => {
    actions = {};
    state = {
      BillingSteps: {
        billing_details: {
          address: {
            country: 'BR',
            state: 'AL',
          },
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
    wrapper = shallowMount(FormCreditCard, {
      localVue,
      i18n,
      propsData: {
        flow: 'test',
      },
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        unnnicToolTip: true,
        unnnicButton: true,
        unnnicSelect: true,
        unnnicInput: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

import { shallowMount } from '@vue/test-utils';
import FormCreditCard from '@/views/billing/plans/FormCreditCard.vue';
import i18n from '@/utils/plugins/i18n';

import { createStore } from 'vuex';
import { org } from '../../../__mocks__';

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
    store = createStore({
      actions,
      getters,
      state,
    });
    wrapper = shallowMount(FormCreditCard, {
      props: {
        flow: 'test',
      },
      global: {
        plugins: [store],
        stubs: {
          UnnnicToolTip: true,
          UnnnicButton: true,
          UnnnicSelect: true,
          UnnnicInput: true,
        },
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

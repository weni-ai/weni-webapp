import { shallowMount } from '@vue/test-utils';
import Modal from '@/components/billing/Modal.vue';
import { createStore } from 'vuex';

import { org } from '../../../__mocks__';

describe('Modal.vue', () => {
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
    wrapper = shallowMount(Modal, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicIconSvg: true,
          UnnnicSlider: true,
          UnnnicTable: true,
          UnnnicTableRow: true,
        },
      },
      props: {
        ranges: [],
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

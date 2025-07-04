import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import WarningMaxActiveContacts from '@/components/billing/WarningMaxActiveContacts.vue';
import { createStore } from 'vuex';

import { org } from '../../../__mocks__';

describe('WarningMaxActiveContacts.vue', () => {
  let wrapper;

  let actions;
  let store;
  let getters;
  let state;

  beforeEach(() => {
    actions = {
      setBillingStep: vi.fn(),
      getOrg: vi.fn(),
      setCurrentOrg: vi.fn(),
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
    store = createStore({
      actions,
      getters,
      state,
    });
    wrapper = shallowMount(WarningMaxActiveContacts, {
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

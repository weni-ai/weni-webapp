import { shallowMount, createLocalVue } from '@vue/test-utils';
import Modal from '@/components/billing/Modal.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);

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
    store = new Vuex.Store({
      actions,
      getters,
      state,
    });
    wrapper = shallowMount(Modal, {
      localVue,
      i18n,
      props: {
        ranges: [],
      },
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicIconSvg: true,
        UnnnicSlider: true,
        UnnnicTable: true,
        UnnnicTableRow: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

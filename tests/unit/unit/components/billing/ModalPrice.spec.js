import { shallowMount, createLocalVue } from '@vue/test-utils';
import ModalPrice from '@/components/billing/ModalPrice.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);

describe('ModalPrice.vue', () => {
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
    wrapper = shallowMount(ModalPrice, {
      localVue,
      i18n,
      propsData: {
        ranges: [],
      },
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

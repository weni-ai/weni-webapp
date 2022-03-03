import { shallowMount, createLocalVue } from '@vue/test-utils';
import Card from '@/components/billing/Card.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import { org } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);

describe('Card.vue', () => {
  let wrapper;

  let actions;
  let store;
  let getters;

  beforeEach(() => {
    actions = {};
    getters = {
      currentOrg() {
        return org;
      },
    };
    store = new Vuex.Store({
      actions,
      getters,
    });
    wrapper = shallowMount(Card, {
      localVue,
      i18n,
      propsData: {
        buttonAction: jest.fn(),
      },
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
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

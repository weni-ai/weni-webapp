import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/utils/plugins/i18n';
import addCreditCard from '@/views/billing/addCreditCard.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

let wrapper;

let actions;
let state;
let getters;
let store;

let options;

function createWrapperWithProps(props) {
  actions = {};
  getters = {};
  state = {};

  store = new Vuex.Store({
    actions,
    state,
    getters,
  });

  options = {
    store,
    localVue,
    i18n,
    mocks: {
      $t: () => '',
    },
    propsData: props,
    stubs: {
      BillingCard: true,
      BillingFormCreditCard: true,
      Report: true,
    },
  };

  wrapper = mount(addCreditCard, options);
}

describe('addCreditCard.vue', () => {
  beforeEach(() => {});

  it('correct title and subtitle depending on the flow prop', () => {
    createWrapperWithProps();

    expect(wrapper.vm.texts).toMatchObject({
      title: 'billing.add_credit_card_title',
      subtitle: 'billing.add_credit_card_subtitle',
    });

    createWrapperWithProps({
      flow: 'add-credit-card',
    });

    expect(wrapper.vm.texts).toMatchObject({
      title: 'billing.add_credit_card.title',
      subtitle: 'billing.change_credit_card.subtitle',
    });

    createWrapperWithProps({
      flow: 'change-credit-card',
    });

    expect(wrapper.vm.texts).toMatchObject({
      title: 'billing.change_credit_card.title',
      subtitle: 'billing.change_credit_card.subtitle',
    });
  });
});

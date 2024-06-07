import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/utils/plugins/i18n';
import Billing from '@/views/billing/billing.vue';
import '@weni/unnnic-system';

const localVue = createLocalVue();

const currentOrgDefault = {
  uuid: 'abcd',
  organization_billing: {
    plan: 'free',
    currenty_invoice: { amount_currenty: '' },
  },
};

localVue.use(Vuex);

describe('Billing.vue', () => {
  let wrapper;

  let actions;
  let state;
  let getters;
  let store;

  let options;

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn(),
      openModal: jest.fn(),
    };

    getters = {
      clicks: () => 2,
      inputValue: () => 'input',
      currentOrg: () => currentOrgDefault,
    };

    state = {
      BillingSteps: {
        flow: '',
      },
    };

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
        $router: {
          push: jest.fn(),
        },
      },
      stubs: {
        DatePicker: true,
        InfiniteLoading: true,
      },
    };

    wrapper = mount(Billing, options);
  });

  it('goes to invoices tab when user clicks to see all', () => {
    expect(wrapper.vm.$data.tab).toBe('payment');
    wrapper.findComponent({ ref: 'seeAllPaymentsButton' }).trigger('click');
    expect(wrapper.vm.$data.tab).toBe('invoices');
  });

  it('opens modal when user click to close plan for enterprise org', () => {
    getters.currentOrg = () => ({
      ...currentOrgDefault,
      organization_billing: {
        ...currentOrgDefault.organization_billing,
        plan: 'enterprise',
        is_active: true,
      },
    });

    store = new Vuex.Store({
      actions,
      state,
      getters,
    });

    wrapper = mount(Billing, { ...options, store });

    wrapper.findComponent({ ref: 'closePlanButton' }).trigger('click');
    expect(wrapper.vm.isModalContactSupportOpen).toBe(true);
  });

  it('goes to change plan page when user click change plan button', () => {
    wrapper.findComponent({ ref: 'changePlanButton' }).trigger('click');
    expect(wrapper.vm.$router.push).lastCalledWith('/orgs/abcd/billing/plans');
  });

  it('converts date string to object', () => {
    expect(wrapper.vm.dateToObject('2022-01-02')).toMatchObject({
      date: '02',
      month: '01',
      year: '2022',
    });
  });
});

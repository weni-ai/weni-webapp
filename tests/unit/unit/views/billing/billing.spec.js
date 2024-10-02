import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Billing from '@/views/billing/billing.vue';
import { unnnicTab } from '@weni/unnnic-system';

const currentOrgDefault = {
  uuid: 'abcd',
  organization_billing: {
    plan: 'free',
    currenty_invoice: { amount_currenty: '' },
  },
};

describe('Billing.vue', () => {
  let wrapper;

  let actions;
  let state;
  let getters;
  let store;

  let options;

  beforeEach(() => {
    actions = {
      actionClick: vi.fn(),
      actionInput: vi.fn(),
      openModal: vi.fn(),
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

    store = createStore({
      actions,
      state,
      getters,
    });

    options = {
      global: {
        plugins: [store],
        mocks: {
          $router: {
            push: vi.fn(),
          },
        },
        stubs: {
          UnnnicIconSvg: true,
          UnnnicButton: true,
          UnnnicToolTip: true,
          UnnnicTab: unnnicTab,
          UnnnicSkeletonLoading: true,
          DatePicker: true,
          InfiniteLoading: {
            render: () => {},
            methods: {
              reset: () => true,
            },
          },
        },
      },
    };

    wrapper = mount(Billing, options);
  });

  it('goes to invoices tab when user clicks to see all', () => {
    expect(wrapper.vm.$data.tab).toBe('payment');
    console.log('wrapper', wrapper.html());
    console.log('comp', wrapper.findComponent(
      '[data-testid=see-all-payments-button]',
    ));
    
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

    store = createStore({
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

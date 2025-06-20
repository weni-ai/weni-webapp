import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Billing from '@/views/billing/billing.vue';
import Unnnic from '@weni/unnnic-system';

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
      getActiveContacts: vi.fn().mockResolvedValue({
        data: {
          projects: [
            {
              active_contacts: 10,
            },
            {
              active_contacts: 20,
            },
          ],
        },
      }),
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
          $route: {
            params: {
              orgUuid: 'abcd',
            },
          },
        },
        stubs: {
          UnnnicIconSvg: true,
          UnnnicButton: true,
          UnnnicToolTip: true,
          UnnnicTab: Unnnic.unnnicTab,
          UnnnicSkeletonLoading: true,
          UnnnicInputDatePicker: true,
          UnnnicCheckbox: true,
          UnnnicTable: true,
          UnnnicTableRow: true,
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

  it('goes to invoices tab when user clicks to see all', async () => {
    expect(wrapper.vm.$data.tab).toBe('payment');

    await wrapper.find({ ref: 'seeAllPaymentsButton' }).trigger('click');
    expect(wrapper.vm.$data.tab).toBe('invoices');
  });

  it('opens modal when user click to close plan for enterprise org', async () => {
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

    wrapper = mount(Billing, {
      global: { ...options.global, plugins: [store] },
    });

    await wrapper.findComponent({ ref: 'closePlanButton' }).trigger('click');
    expect(wrapper.vm.isModalContactSupportOpen).toBe(true);
  });

  it('goes to change plan page when user click change plan button', () => {
    wrapper.findComponent({ ref: 'changePlanButton' }).trigger('click');
    expect(wrapper.emitted('open-modal-trial-period')).toBeTruthy();
  });

  it('converts date string to object', () => {
    expect(wrapper.vm.dateToObject('2022-01-02')).toMatchObject({
      date: '02',
      month: '01',
      year: '2022',
    });
  });

  it('fetches and displays total active contacts', async () => {
    expect(wrapper.vm.totalActiveContacts).toBe(30);
  });
});

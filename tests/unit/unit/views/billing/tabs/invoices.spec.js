import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createStore } from 'vuex';
import Invoices from '@/views/billing/tabs/invoices.vue';
import { vi } from 'vitest';

vi.mock('@/api/request.js', () => {});

describe('BillingInvoices.vue', () => {
  let wrapper;
  let store;
  let actions;

  beforeEach(() => {
    actions = {
      clearCurrentOrg: vi.fn(),
      clearCurrentProject: vi.fn(),
      createOrg: vi.fn(),
      changeAuthorization: vi.fn(),
      createProject: vi.fn(),
      setCurrentOrg: vi.fn(),
      setCurrentProject: vi.fn(),
      openModal: vi.fn(),
      setBillingOrgStep: vi.fn(),
      setBillingMembersStep: vi.fn(),
      setBillingProjectStep: vi.fn(),
      backBilling: vi.fn(),
    };

    store = createStore({
      actions,
    });

    wrapper = shallowMount(Invoices, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: RouterLinkStub,
          Indicator: true,
          UserManagement: true,
          Emoji: true,
          container: true,
          UnnnicButton: true,
          UnnnicSelect: true,
          UnnnicInput: true,
          UnnnicInputDatePicker: true,
          UnnnicTable: true,
          UnnnicTableRow: true,
          UnnnicSkeletonLoading: true,
          UnnnicCheckbox: true,
          UnnnicIconSvg: true,
        },
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

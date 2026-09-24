import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import Invoices from '@/views/billing/tabs/invoices.vue';
import { vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

vi.mock('@/api/request.js', () => ({}));

describe('BillingInvoices.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Invoices, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              Org: {
                currentOrg: {
                  organization_billing: {
                    plan_method: 'attendances',
                  },
                },
              },
            },
          }),
        ],
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

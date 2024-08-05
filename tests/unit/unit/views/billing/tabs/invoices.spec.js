import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import Invoices from '@/views/billing/tabs/invoices.vue';
import i18n from '@/utils/plugins/i18n';
import { vi } from 'vitest';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

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

    store = new Vuex.Store({
      actions,
    });

    wrapper = shallowMount(Invoices, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
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
      },
    });
  });

  it.only('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

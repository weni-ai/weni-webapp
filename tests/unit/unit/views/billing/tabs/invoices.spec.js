import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import Invoices from '@/views/billing/tabs/invoices.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

// jest.mock('@/services/SecurityService.js', () => {});
jest.mock('@/api/request.js', () => {});

describe('BillingInvoices.vue', () => {
  let wrapper;
  let store;
  let actions;

  beforeEach(() => {
    actions = {
      clearCurrentOrg: jest.fn(),
      clearCurrentProject: jest.fn(),
      createOrg: jest.fn(),
      changeAuthorization: jest.fn(),
      createProject: jest.fn(),
      setCurrentOrg: jest.fn(),
      setCurrentProject: jest.fn(),
      openModal: jest.fn(),
      setBillingOrgStep: jest.fn(),
      setBillingMembersStep: jest.fn(),
      setBillingProjectStep: jest.fn(),
      backBilling: jest.fn(),
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
        UnnnicDatePicker: true,
        UnnnicTable: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

import { vi } from 'vitest';
import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import createOrg from '@/views/org/createOrg.vue';
import i18n from '@/utils/plugins/i18n';
import { profile, org, user } from '../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('createOrg.vue', () => {
  let wrapper;
  let store;
  let getters;
  let actions;
  let state;

  beforeEach(() => {
    getters = {
      currentOrg() {
        return org;
      },
    };

    actions = {
      openModal: vi.fn(),
      setBillingOrgStep: vi.fn(),
      setBillingMembersStep: vi.fn(),
      setBillingProjectStep: vi.fn(),
      backBilling: vi.fn(),
      resetBillingSteps: vi.fn(),
      getOrg: vi.fn(),
      setCurrentOrg: vi.fn(),
      onProceedPermissions: vi.fn(),
    };

    state = {
      BillingSteps: {
        current: 0,
      },
      Account: {
        profile,
      },
    };

    store = new Vuex.Store({
      actions,
      state,
      getters,
    });

    wrapper = shallowMount(createOrg, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        UserManagement: true,
        UnnnicInput: true,
        Indicator: true,
        Container: true,
        SkeletonLoading: true,
        UnnnicButton: true,
        UnnnicSelect: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('reloadCurrentOrg', () => {
    it('get org and set current org', async () => {
      const sleepSpy = vi.spyOn(wrapper.vm, 'sleep');
      actions.getOrg.mockImplementation(() => {
        return { data: { org } };
      });
      await wrapper.vm.reloadCurrentOrg();
      expect(sleepSpy).toHaveBeenCalledTimes(1);
      expect(actions.getOrg).toHaveBeenCalledTimes(1);
      expect(actions.setCurrentOrg).toHaveBeenCalledTimes(1);
    });
    it('get an error', async () => {
      const sleepSpy = vi.spyOn(wrapper.vm, 'sleep');
      const spyRouter = vi.spyOn(wrapper.vm.$router, 'push');

      actions.getOrg.mockImplementation(() => {
        throw new Error('error fetching');
      });

      await wrapper.vm.reloadCurrentOrg();
      expect(sleepSpy).toHaveBeenCalledTimes(1);
      expect(spyRouter).toHaveBeenCalledTimes(1);
    });
  });

  describe('onProceedPermissions', () => {
    it('has user in users array and shoud call setBillingMembersStep', async () => {
      wrapper.setData({
        users: [],
      });
      await wrapper.vm.onProceedPermissions();
      expect(actions.setBillingMembersStep).toHaveBeenCalled();
    });
  });

  describe('back', () => {
    it('verify if has not data in store', async () => {
      const spyRouter = vi.spyOn(wrapper.vm.$router, 'push');

      await wrapper.setData({
        orgName: '',
        orgDescription: '',
        projectName: '',
        users: [user],
      });
      await wrapper.vm.back();

      expect(actions.backBilling).toHaveBeenCalled();
      expect(spyRouter).toHaveBeenCalled();
    });

    it('should open modal verification', async () => {
      wrapper.setData({
        orgName: 'test',
        users: [user],
      });
      await wrapper.vm.back();
      expect(actions.openModal).toHaveBeenCalled();
    });
  });

  it('steps', async () => {
    const text = 'some specific text';
    const steps = wrapper.vm.steps;
    expect(steps).toEqual([text, text, text]);
  });

  describe('canProgress', () => {
    it('verify current is equal to 0 and has org name and org org description', () => {
      wrapper.setData({
        orgName: 'test',
        orgDescription: 'top',
      });

      expect(wrapper.vm.canProgress).toBeTruthy();
    });
    it('verify current is equal to 0 and has not org name and org org description', async () => {
      await wrapper.setData({
        orgName: '',
        orgDescription: '',
      });

      expect(wrapper.vm.canProgress).toBeFalsy();
    });

    it('current 1 should just return', () => {
      wrapper.vm.$store.state.BillingSteps.current = 1;
      expect(wrapper.vm.canProgress).toBeTruthy();
    });
    it('current 2 should verify project name, date format and timezone', async () => {
      wrapper.vm.$store.state.BillingSteps.current = 2;
      wrapper.setData({
        projectName: '23',
        dateFormat: '22',
        timeZone: '12',
      });
      expect(wrapper.vm.canProgress).toBeTruthy();
    });

    it('verify other currents', () => {
      wrapper.vm.$store.state.BillingSteps.current = 3;
      expect(wrapper.vm.canProgress).toBeTruthy();
    });
  });
});

import { vi } from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import orgPermissions from '@/components/common/RightBar/orgPermissions.vue';
import UserManagement from '@/components/orgs/UserManagement.vue';
import i18n from '@/utils/plugins/i18n';
import { org, user } from '../../../__mocks__/';

const localVue = createLocalVue();
localVue.use(Vuex);

vi.mock('@/api/request.js', () => {});

import { unnnicCallAlert as mockUnnnicCallAlert } from '@weni/unnnic-system';

vi.mock('@weni/unnnic-system', () => ({
  unnnicCallAlert: vi.fn(),
  unnnicCallModal: vi.fn(),
}));

import orgs from '@/api/orgs';

vi.mock('@/api/orgs.js', () => ({
  default: {
    createRequestPermission: vi.fn(),
  },
}));

describe('orgPermissions.vue', () => {
  let wrapper;
  let state;
  let actions;
  let store;

  beforeEach(() => {
    state = {
      Org: {
        orgs: { data: [org] },
      },
    };

    actions = {
      getMembers: vi.fn(),
      changeAuthorization: vi.fn(),
      openModal: vi.fn(),
    };

    store = new Vuex.Store({
      state,
      actions,
    });

    wrapper = shallowMount(orgPermissions, {
      localVue,
      store,
      i18n,
      mocks: {
        $t: () => 'some specific text',
        Keycloak: vi.fn(),
      },
      stubs: {
        orgRole: true,
        SearchUser: true,
        InfiniteLoading: true,
        UserManagement,
      },
      propsData: {
        orgUuid: org.uuid,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('test props', async () => {
    expect(wrapper.vm.org).toBe(org);
  });

  it('genericError()', () => {
    wrapper.vm.genericError();
    expect(actions.openModal).toHaveBeenCalled();
  });

  describe('changeRole()', () => {
    it('works as well', async () => {
      actions.changeAuthorization.mockImplementation(() => {
        return true;
      });

      await wrapper.vm.changeRole({ id: '123', role: 3 });

      expect(mockUnnnicCallAlert).toHaveBeenCalled();
    });

    it('got an error', async () => {
      actions.changeAuthorization.mockImplementation(() => {
        throw new Error('error fetching');
      });

      await wrapper.vm.changeRole({ id: '123', role: 3 });

      expect(actions.openModal).toHaveBeenCalled();
    });
  });

  describe('addMember()', () => {
    it('got an error', async () => {
      orgs.createRequestPermission.mockImplementation(() => {
        throw new Error('error fetching');
      });

      const spy = vi.spyOn(wrapper.vm, 'genericError');

      await wrapper.vm.addMember(user);

      expect(spy).toHaveBeenCalled();
    });

    // it('got an success', async () => {
    //   orgs.createRequestPermission.mockImplementation(() => {
    //     return { user, id: '321', status: 'pending' };
    //   });

    //   user.status = 'pending';

    //   await wrapper.vm.addMember(user);

    //   expect(user.id).toEqual('321');
    // });
  });

  describe('fetchPermissions', () => {
    it('got an error', async () => {
      actions.getMembers.mockImplementation(() => {
        throw new Error('error fetching');
      });

      const state = {
        error: vi.fn(),
        loaded: vi.fn(),
      };

      const spyError = vi.spyOn(state, 'error');
      const spyLoaded = vi.spyOn(state, 'loaded');

      await wrapper.vm.fetchPermissions(state);

      expect(spyError).toHaveBeenCalled();
      expect(spyLoaded).toHaveBeenCalled();
      expect(wrapper.vm.loading).toBeFalsy();
    });

    it('got finished with complete true', async () => {
      actions.getMembers.mockImplementation(() => {
        return { data: { results: [user] } };
      });

      const state = {
        error: vi.fn(),
        loaded: vi.fn(),
        complete: vi.fn(),
      };

      const spyComplete = vi.spyOn(state, 'complete');

      await wrapper.vm.fetchPermissions(state);

      expect(spyComplete).toHaveBeenCalled();
      expect(wrapper.vm.loading).toBeFalsy();
    });
  });
});

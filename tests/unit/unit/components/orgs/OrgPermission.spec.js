import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import orgPermissions from '@/components/common/RightBar/orgPermissions.vue';
import UserManagement from '@/components/orgs/UserManagement.vue';

import { org, user } from '../../../__mocks__/';
import { useModalStore } from '@/store/modal';
import { useOrgStore } from '@/store/org';

vi.mock('@/api/request.js', () => ({}));

import Unnnic from '@weni/unnnic-system';

const callAlert = vi.spyOn(Unnnic, 'unnnicCallAlert');

import orgs from '@/api/orgs';
import profile from '../../../__mocks__/profile';

vi.mock('@/api/orgs.js', () => ({
  default: {
    createRequestPermission: vi.fn(),
  },
}));

describe('orgPermissions.vue', () => {
  let wrapper;
  let actions;

  beforeEach(() => {
    wrapper = shallowMount(orgPermissions, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              account: {
                profile,
              },
              Org: {
                orgs: { data: [org] },
              },
            },
          }),
        ],
        mocks: {
          Keycloak: vi.fn(),
        },
        stubs: {
          orgRole: true,
          SearchUser: true,
          InfiniteLoading: true,
          UnnnicInput: true,
          UnnnicButton: true,
          UserManagement,
        },
      },
      props: {
        orgUuid: org.uuid,
      },
    });

    const orgStore = useOrgStore();
    actions = {
      getMembers: orgStore.getMembers,
      changeAuthorization: orgStore.changeAuthorization,
    };
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('test props', async () => {
    expect(wrapper.vm.org).toStrictEqual(org);
  });

  it('showErrorNotification()', () => {
    wrapper.vm.showErrorNotification();
    expect(useModalStore().openModal).toHaveBeenCalled();
  });

  describe('changeRole()', () => {
    it('works as well', async () => {
      actions.changeAuthorization.mockImplementation(() => {
        return true;
      });

      await wrapper.vm.changeRole({ id: '123', role: 3 });

      expect(callAlert).toHaveBeenCalled();
    });

    it('got an error', async () => {
      actions.changeAuthorization.mockImplementation(() => {
        throw new Error('error fetching');
      });

      await wrapper.vm.changeRole({ id: '123', role: 3 });

      expect(useModalStore().openModal).toHaveBeenCalled();
    });
  });

  describe('addMember()', () => {
    it('got an error', async () => {
      orgs.createRequestPermission.mockImplementation(() => {
        throw new Error('error fetching');
      });

      const spy = vi.spyOn(wrapper.vm, 'showErrorNotification');

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

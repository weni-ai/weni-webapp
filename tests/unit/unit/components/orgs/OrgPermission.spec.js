import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import orgPermissions from '@/components/orgs/orgPermissions.vue';
import UserManagement from '@/components/orgs/UserManagement.vue';
import i18n from '@/utils/plugins/i18n';
import { org, user } from '../../../__mocks__/';

const localVue = createLocalVue();
localVue.use(Vuex);

jest.mock('@/api/request.js', () => {});

import { unnnicCallAlert as mockUnnnicCallAlert } from '@weni/unnnic-system';
import { unnnicCallModal as mockUnnnicCallModal } from '@weni/unnnic-system';

jest.mock('@weni/unnnic-system', () => ({
  ...jest.requireActual('@weni/unnnic-system'),
  unnnicCallAlert: jest.fn(),
  unnnicCallModal: jest.fn(),
}));

import orgs from '@/api/orgs';

jest.mock('@/api/orgs.js', () => {
  return {
    createRequestPermission: jest.fn(),
  };
});

describe('orgPermissions.vue', () => {
  let wrapper;
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      getMembers: jest.fn(),
      addAuthorization: jest.fn(),
      changeAuthorization: jest.fn(),
      removeAuthorization: jest.fn(),
    };

    store = new Vuex.Store({
      modules: {
        org: {
          actions,
        },
        Account: {
          state: {
            profile: {
              username: 'test',
            },
          },
        },
      },
    });

    wrapper = shallowMount(orgPermissions, {
      localVue,
      store,
      i18n,
      mocks: {
        $t: () => 'some specific text',
        Keycloak: jest.fn(),
      },
      stubs: {
        orgRole: true,
        SearchUser: true,
        InfiniteLoading: true,
        UserManagement,
      },
      propsData: {
        org,
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
    expect(mockUnnnicCallModal).toHaveBeenCalled();
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

      expect(mockUnnnicCallModal).toHaveBeenCalled();
    });
  });

  describe('addMember()', () => {
    it('got an error', async () => {
      orgs.createRequestPermission.mockImplementation(() => {
        throw new Error('error fetching');
      });

      const spy = jest.spyOn(wrapper.vm, 'genericError');

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
        error: jest.fn(),
        loaded: jest.fn(),
      };

      const spyError = jest.spyOn(state, 'error');
      const spyLoaded = jest.spyOn(state, 'loaded');

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
        error: jest.fn(),
        loaded: jest.fn(),
        complete: jest.fn(),
      };

      const spyComplete = jest.spyOn(state, 'complete');

      await wrapper.vm.fetchPermissions(state);

      expect(spyComplete).toHaveBeenCalled();
      expect(wrapper.vm.loading).toBeFalsy();
    });
  });
});

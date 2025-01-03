import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import account from '@/views/account.vue';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

describe('account.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;
  let state;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return org;
      },
      currentProject: () => {
        return project;
      },
    };
    state = {
      Account: {
        profile,
      },
    };
    actions = {
      updateProfile: vi.fn(),
      updateProfilePicture: vi.fn(),
      removeProfilePicture: vi.fn(),
      openModal: vi.fn(),
    };

    store = createStore({
      getters,
      actions,
      state,
    });

    wrapper = shallowMount(account, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicButton: true,
          UnnnicInput: true,
          avatar: true,
          UnnnicCard: true,
        },
        mocks: {
          $route: {},
        },
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

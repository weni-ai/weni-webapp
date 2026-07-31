import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createTestingPinia } from '@pinia/testing';
import account from '@/views/account.vue';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

describe('account.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return org;
      },
      currentProject: () => {
        return project;
      },
    };
    actions = {
      openModal: vi.fn(),
    };

    store = createStore({
      getters,
      actions,
    });

    wrapper = shallowMount(account, {
      global: {
        plugins: [
          store,
          createTestingPinia({
            initialState: {
              account: {
                profile,
              },
            },
          }),
        ],
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

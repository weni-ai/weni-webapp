import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import help from '@/views/help.vue';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

vi.mock('@/api/request.js', () => {});

describe('help.vue', () => {
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

    wrapper = shallowMount(help, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicButton: true,
          emoji: true,
          UnnnicAccordion: true,
        },
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

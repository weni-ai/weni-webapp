import { vi } from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import help from '@/views/help.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

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

    store = new Vuex.Store({
      getters,
      actions,
      state,
    });

    wrapper = shallowMount(help, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicButton: true,
        emoji: true,
        UnnnicAccordion: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});

import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import notFound from '@/views/not-found.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

jest.mock('@/api/request.js', () => {});
jest.mock('@/api/account.js', () => {
  return {
    profile: () => ({ data: { language: 'pt-br' } }),
  };
});

describe('notFound.vue', () => {
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

    store = new Vuex.Store({
      getters,
      actions,
      state,
    });

    wrapper = shallowMount(notFound, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        unnnicButton: true,
        emoji: true,
        unnnicAccordion: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

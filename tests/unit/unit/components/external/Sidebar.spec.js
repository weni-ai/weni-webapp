import { vi } from 'vitest';
import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Sidebar from '@/components/external/Sidebar.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import Router from 'vue-router';

import { project } from '../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('Sidebar.vue', () => {
  let wrapper;
  let getters;
  let store;
  let actions;
  let $route = {
    path: '/',
  };

  beforeEach(() => {
    getters = {
      currentProject() {
        return project;
      },
    };
    actions = {
      updateAccountLanguage: vi.fn(),
    };
    store = new Vuex.Store({ getters, actions });
    wrapper = shallowMount(Sidebar, {
      localVue,
      i18n,
      router,
      store,
      mocks: {
        $t: () => 'some specific text',
        $route,
      },
      stubs: {
        RouterLink: RouterLinkStub,
        UnnnicSidebarPrimary: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('verify change language', async () => {
    await wrapper.vm.changeLanguage('es');
    expect(actions.updateAccountLanguage).toHaveBeenCalled();
  });

  it('verify pathname', async () => {
    const res = await wrapper.vm.pathname(false, 'oi');
    expect(res).toEqual('/oi');
  });
  it('verify pathname with context', async () => {
    const res = await wrapper.vm.pathname('test', 'oi');
    expect(res).toEqual('/test/oi');
  });
});

import Notifications from '@/components/common/RightBar/Notifications.vue';
import { createLocalVue, mount } from '@vue/test-utils';
import { vi } from 'vitest';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';

import StoreProject from '@/store/project/index.js';
import StoreNews from '@/store/News/index.js';

vi.mock('@/api/projects.js', () => ({
  default: {
    latestActivities: vi.fn().mockResolvedValue({
      data: {
        next: null,
        previous: null,
        results: [
          {
            user: 'Matheus Cristian',
            action: 'created-ai',
            created_at: '2024-08-22T19:51:46.782295Z',
            name: 'teste',
          },
          {
            user: 'Matheus Cristian',
            action: 'created-ai',
            created_at: '2024-08-22T19:51:12.662878Z',
            name: 'teste',
          },
          {
            user: 'Matheus Cristian',
            action: 'created-ai',
            created_at: '2024-08-16T19:36:30.895601Z',
            name: 'teste',
          },
        ],
      },
    }),
  },
}));

vi.mock('@/store/index.js', () => ({
  default: {},
}));

const localVue = createLocalVue();

localVue.use(UnnnicSystem);
localVue.use(VueRouter);
localVue.use(Vuex);
localVue.use(VueI18n);

const router = new VueRouter({
  routes: [
    {
      path: '/project/:projectUuid',
      name: 'home',
    },
  ],
});

const store = new Vuex.Store({
  modules: {
    Project: StoreProject,
    News: StoreNews,
  },
});

const i18n = new VueI18n({
  locale: 'en',
  silentTranslationWarn: true,
});

const setup = () =>
  mount(Notifications, {
    localVue,
    router,
    store,
    i18n,

    props: {},

    mocks: {},
  });

const intersectionObserverObserve = vi.fn();
const intersectionObserverUnobserve = vi.fn();

window.IntersectionObserver = function (fn) {
  fn([{ isIntersecting: true }]);

  return {
    observe: intersectionObserverObserve,
    unobserve: intersectionObserverUnobserve,
  };
};

router.push('/project/1234');

describe('Notifications.vue', () => {
  let wrapper;

  it('observe should be called on mounted', async () => {
    wrapper = setup();

    expect(intersectionObserverObserve).toHaveBeenCalled();
  });

  it('unobserve should be called on destroy', () => {
    wrapper = setup();

    wrapper.destroy();

    expect(intersectionObserverUnobserve).toHaveBeenCalled();
  });
});

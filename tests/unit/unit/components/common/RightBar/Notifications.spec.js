import Notifications from '@/components/common/RightBar/Notifications.vue';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import { createRouter, createWebHistory } from 'vue-router';

import { createTestingPinia } from '@pinia/testing';

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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/project/:projectUuid',
      name: 'home',
    },
  ],
});

const setup = () =>
  mount(Notifications, {
    global: {
      plugins: [
        UnnnicSystem,
        router,
        createTestingPinia({ stubActions: false }),
      ],
    },
    props: {},
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

    wrapper.unmount();

    expect(intersectionObserverUnobserve).toHaveBeenCalled();
  });
});

import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemInsights from '../SystemInsights.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '../../store/Shared';

const { mockRouterAfterEach, mockRouterUnsubscribe, mockMountInsightsApp } =
  vi.hoisted(() => {
    const mockRouterAfterEach = vi.fn();
    const mockRouterUnsubscribe = vi.fn();

    const mockMountInsightsApp = vi.fn().mockResolvedValue({
      app: {
        unmount: vi.fn(),
      },
      router: {
        afterEach: mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe),
        replace: vi.fn(),
      },
    });

    return {
      mockRouterAfterEach,
      mockRouterUnsubscribe,
      mockMountInsightsApp,
    };
  });

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountInsightsApp),
}));

vi.mock('@/store/Shared', () => ({
  useSharedStore: vi.fn().mockReturnValue({
    current: {
      project: { uuid: 'test-uuid' },
    },
    auth: {
      token: 'mock-token',
    },
  }),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:projectUuid/insights',
      name: 'insights',
    },
  ],
});

describe('SystemInsights', () => {
  let wrapper;
  let sharedStore;

  const createWrapper = (storeOverrides = {}) => {
    const defaultStore = {
      current: {
        project: { uuid: 'test-uuid' },
      },
      auth: {
        token: 'mock-token',
      },
    };

    useSharedStore.mockReturnValue({
      ...defaultStore,
      ...storeOverrides,
    });

    return shallowMount(SystemInsights, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          ExternalSystem: {
            name: 'ExternalSystem',
            template: '<div class="external-system"></div>',
            methods: {
              init: vi.fn(),
              reset: vi.fn(),
            },
          },
        },
      },
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe);

    wrapper = createWrapper();

    await router.push({
      name: 'insights',
      params: { projectUuid: 'test-uuid' },
    });

    sharedStore = useSharedStore();
    sharedStore.auth.token = 'mock-token';
    sharedStore.current.project.uuid = 'test-uuid';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders loading state when insights app is not mounted', async () => {
    wrapper.vm.insightsApp = null;
    wrapper.vm.useIframe = false;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.findComponent('[data-testid="insights-loading"]').exists(),
    ).toBe(true);
  });

  it('mounts insights app when modelValue is true', async () => {
    wrapper.vm.insightsApp = null;
    wrapper.vm.useIframe = false;

    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockMountInsightsApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="insights-app"]').exists()).toBe(true);
  });

  it('falls back to iframe when module federation fails', async () => {
    wrapper.vm.insightsApp = null;
    wrapper.vm.useIframe = true;

    await wrapper.vm.$nextTick();
    expect(
      wrapper.findComponent('[data-testid="insights-iframe"]').exists(),
    ).toBe(true);
  });

  it('sets insights app to null when component is unmounted', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.insightsApp).not.toBe(null);
    await wrapper.vm.unmount();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.insightsApp).toBe(null);
  });

  it('does not render when token is missing', async () => {
    wrapper.unmount();

    wrapper = createWrapper({
      auth: {
        token: null,
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="insights-app"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="insights-iframe"]').exists()).toBe(
      false,
    );
  });

  it('does not render when current project is missing', async () => {
    wrapper.unmount();

    wrapper = createWrapper({
      current: {
        project: { uuid: null },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="insights-app"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="insights-iframe"]').exists()).toBe(
      false,
    );
  });

  it('sets up router sync when mounting insights app', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockRouterAfterEach).toHaveBeenCalled();
    expect(wrapper.vm.routerUnsubscribe).toBe(mockRouterUnsubscribe);
  });

  it('dispatches updateRoute event when module router changes', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const afterEachCallback = mockRouterAfterEach.mock.calls[0][0];

    afterEachCallback({
      path: '/test-uuid',
      query: { param1: 'value1' },
      fullPath: '/test-uuid?param1=value1',
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'insights/test-uuid',
          query: { param1: 'value1' },
        },
      }),
    );

    dispatchEventSpy.mockRestore();
  });

  it('cleans up router subscription on unmount', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.routerUnsubscribe).toBe(mockRouterUnsubscribe);

    await wrapper.vm.unmount();

    expect(mockRouterUnsubscribe).toHaveBeenCalled();
    expect(wrapper.vm.routerUnsubscribe).toBe(null);
    expect(wrapper.vm.insightsRouter).toBe(null);
  });

  it('handles empty query params in updateRoute event', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const afterEachCallback = mockRouterAfterEach.mock.calls[0][0];

    afterEachCallback({
      path: '/test-uuid',
      query: {},
      fullPath: '/test-uuid',
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'insights/test-uuid',
          query: {},
        },
      }),
    );

    dispatchEventSpy.mockRestore();
  });
});

import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FederatedModule from '../modules/FederatedModule.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '../../store/Shared';

const { mockRouterAfterEach, mockRouterUnsubscribe, mockMountBulkSendApp } =
  vi.hoisted(() => {
    const mockRouterAfterEach = vi.fn();
    const mockRouterUnsubscribe = vi.fn();

    const mockMountBulkSendApp = vi.fn().mockResolvedValue({
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
      mockMountBulkSendApp,
    };
  });

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountBulkSendApp),
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
      path: '/:projectUuid/bulkSend',
      name: 'bulkSend',
    },
  ],
});

const bulkSendProps = {
  moduleName: 'bulkSend',
  importFn: () => import('bulk_send/main'),
  importPath: 'bulk_send/main',
  containerId: 'bulk-send-app',
  routeNames: ['bulkSend'],
  forceRemountEvent: 'forceRemountBulkSend',
  modelValue: true,
};

describe('FederatedModule (BulkSend)', () => {
  let wrapper;
  let sharedStore;

  const createWrapper = (storeOverrides = {}, propsOverrides = {}) => {
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

    return shallowMount(FederatedModule, {
      props: {
        ...bulkSendProps,
        ...propsOverrides,
      },
      global: {
        plugins: [createTestingPinia(), router],
      },
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe);

    wrapper = createWrapper();

    await router.push({
      name: 'bulkSend',
      params: { projectUuid: 'test-uuid' },
    });

    sharedStore = useSharedStore();
    sharedStore.auth.token = 'mock-token';
    sharedStore.current.project.uuid = 'test-uuid';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders loading state when bulk send app is not mounted', async () => {
    wrapper.vm.app = null;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.findComponent('[data-testid="bulkSend-loading"]').exists(),
    ).toBe(true);
  });

  it('mounts bulk send app when modelValue is true', async () => {
    wrapper.vm.app = null;

    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockMountBulkSendApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="bulkSend-app"]').exists()).toBe(true);
  });

  it('sets bulk send app to null when component is unmounted', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.app).not.toBe(null);
    await wrapper.vm.unmount();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.app).toBe(null);
  });

  it('does not render when token is missing', async () => {
    wrapper.unmount();

    wrapper = createWrapper({
      auth: {
        token: null,
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="bulkSend-app"]').exists()).toBe(false);
  });

  it('does not render when current project is missing', async () => {
    wrapper.unmount();

    wrapper = createWrapper({
      current: {
        project: { uuid: null },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="bulkSend-app"]').exists()).toBe(false);
  });

  it('sets up router sync when mounting bulk send app', async () => {
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
      path: '/test-path',
      query: { filter: 'value1' },
      fullPath: '/test-path?filter=value1',
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'bulkSend/test-path',
          query: { filter: 'value1' },
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
    expect(wrapper.vm.moduleRouter).toBe(null);
  });

  it('handles empty query params in updateRoute event', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const afterEachCallback = mockRouterAfterEach.mock.calls[0][0];

    afterEachCallback({
      path: '/test-path',
      query: {},
      fullPath: '/test-path',
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'bulkSend/test-path',
          query: {},
        },
      }),
    );

    dispatchEventSpy.mockRestore();
  });

  it('unmounts when project uuid changes', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.app).not.toBe(null);

    wrapper.unmount();
    wrapper = createWrapper({
      current: {
        project: { uuid: 'new-uuid' },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.app).toBe(null);
  });

  it('does not mount when modelValue is false', async () => {
    wrapper.unmount();
    vi.clearAllMocks();

    wrapper = createWrapper({}, { modelValue: false });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.app).toBe(null);
  });
});

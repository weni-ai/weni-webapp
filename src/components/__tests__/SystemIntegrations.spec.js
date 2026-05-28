import { shallowMount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemIntegrations from '../SystemIntegrations.vue';
import FederatedModule from '../modules/FederatedModule.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '../../store/Shared';

const {
  mockRouterAfterEach,
  mockRouterUnsubscribe,
  mockMountIntegrationsApp,
} = vi.hoisted(() => {
  const mockRouterAfterEach = vi.fn();
  const mockRouterUnsubscribe = vi.fn();

  const mockMountIntegrationsApp = vi.fn().mockResolvedValue({
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
    mockMountIntegrationsApp,
  };
});

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountIntegrationsApp),
}));

vi.mock('@/store/Shared', async (importOriginal) => {
  const { computed } = await import('vue');
  const { useRoute } = await import('vue-router');
  const actual = await importOriginal();

  const createMockStore = (overrides = {}) => ({
    current: {
      project: { uuid: 'test-uuid' },
      ...(overrides.current || {}),
    },
    auth: {
      token: 'mock-token',
      ...(overrides.auth || {}),
    },
    setIsActiveFederatedModule: vi.fn(),
    ...overrides,
  });

  const useSharedStore = vi.fn(() => createMockStore());

  const useSharedProjectContext = () => {
    const route = useRoute();
    const sharedStore = useSharedStore();
    const projectUuid = computed(() =>
      actual.getSharedProjectUuid(actual.getRouteProjectUuid(route)),
    );
    const canLoadFederatedModule = computed(
      () => Boolean(sharedStore.auth?.token && projectUuid.value),
    );

    return {
      sharedStore,
      projectUuid,
      canLoadFederatedModule,
    };
  };

  return {
    ...actual,
    useSharedStore,
    useSharedProjectContext,
  };
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/projects/:projectUuid/settings',
      component: { template: '<router-view />' },
      children: [
        {
          path: 'channels/:internal+',
          name: 'settingsChannels',
          component: { template: '<div />' },
        },
      ],
    },
  ],
});

describe('SystemIntegrations', () => {
  let wrapper;
  let sharedStore;

  const getFm = () => wrapper.findComponent(FederatedModule);

  const createWrapper = (storeOverrides = {}) => {
    const defaultStore = {
      current: {
        project: { uuid: 'test-uuid' },
      },
      auth: {
        token: 'mock-token',
      },
      setIsActiveFederatedModule: vi.fn(),
    };

    useSharedStore.mockReturnValue({
      ...defaultStore,
      ...storeOverrides,
    });

    return shallowMount(SystemIntegrations, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          FederatedModule: false,
        },
      },
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe);

    await router.push({
      name: 'settingsChannels',
      params: { projectUuid: 'test-uuid', internal: ['init'] },
    });
    await router.isReady();

    wrapper = createWrapper();

    sharedStore = useSharedStore();
    sharedStore.auth.token = 'mock-token';
    sharedStore.current.project.uuid = 'test-uuid';

    await flushPromises();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders loading state when integrations app is not mounted', async () => {
    getFm().vm.app = null;
    getFm().vm.useIframe = false;

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .findComponent('[data-testid="settingsChannels-loading"]')
        .exists(),
    ).toBe(true);
  });

  it('mounts integrations app when modelValue is true', async () => {
    await flushPromises();

    expect(mockMountIntegrationsApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="settingsChannels-app"]').exists()).toBe(
      true,
    );
    expect(getFm().vm.app).not.toBe(null);
  });

  it('passes absolute initialRoute for deep links', async () => {
    wrapper.unmount();
    vi.clearAllMocks();

    await router.push({
      name: 'settingsChannels',
      params: { projectUuid: 'test-uuid', internal: ['apps', 'my'] },
    });
    await router.isReady();

    wrapper = createWrapper();
    await flushPromises();

    expect(mockMountIntegrationsApp).toHaveBeenCalledWith({
      containerId: 'integrations-app',
      initialRoute: { path: '/apps/my', query: {} },
    });
  });

  it('sets integrations app to null when component is unmounted', async () => {
    await flushPromises();

    expect(getFm().vm.app).not.toBe(null);

    await getFm().vm.unmount();
    await flushPromises();

    expect(getFm().vm.app).toBe(null);
  });

  it('does not mount when token is missing', async () => {
    wrapper.unmount();
    await flushPromises();
    vi.clearAllMocks();

    wrapper = createWrapper({
      auth: {
        token: null,
      },
    });

    await flushPromises();

    expect(getFm().vm.app).toBe(null);
    expect(mockMountIntegrationsApp).not.toHaveBeenCalled();
  });

  it('does not mount when project uuid is missing from route and store', async () => {
    wrapper.unmount();
    await flushPromises();
    vi.clearAllMocks();

    await router.push({
      name: 'settingsChannels',
      params: { projectUuid: '', internal: ['init'] },
    });
    await router.isReady();

    wrapper = createWrapper({
      current: {
        project: { uuid: null },
      },
      auth: {
        token: 'mock-token',
      },
    });

    await flushPromises();

    expect(getFm().vm.app).toBe(null);
    expect(mockMountIntegrationsApp).not.toHaveBeenCalled();
  });

  it('sets up router sync when mounting integrations app', async () => {
    await flushPromises();

    expect(mockRouterAfterEach).toHaveBeenCalled();
    expect(getFm().vm.routerUnsubscribe).toBe(mockRouterUnsubscribe);
  });

  it('dispatches updateRoute event when module router changes', async () => {
    await flushPromises();

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const afterEachCallback = mockRouterAfterEach.mock.calls[0][0];

    afterEachCallback({
      path: '/discovery',
      query: { filter: 'value1' },
      fullPath: '/discovery?filter=value1',
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'settingsChannels/discovery',
          query: { filter: 'value1' },
        },
      }),
    );

    dispatchEventSpy.mockRestore();
  });

  it('cleans up router subscription on unmount', async () => {
    await flushPromises();

    expect(getFm().vm.routerUnsubscribe).toBe(mockRouterUnsubscribe);

    await getFm().vm.unmount();

    expect(mockRouterUnsubscribe).toHaveBeenCalled();
    expect(getFm().vm.routerUnsubscribe).toBe(null);
    expect(getFm().vm.moduleRouter).toBe(null);
  });

  it('unmounts when project uuid changes', async () => {
    await flushPromises();

    expect(getFm().vm.app).not.toBe(null);

    await router.push({
      name: 'settingsChannels',
      params: { projectUuid: 'new-uuid', internal: ['init'] },
    });
    await router.isReady();
    await flushPromises();

    expect(getFm().vm.app).toBe(null);
  });
});

import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive, ref } from 'vue';
import { useFederatedModule } from '../useFederatedModule';
import { tryImportWithRetries } from '@/utils/moduleFederation';

const { mockRouterAfterEach, mockRouterUnsubscribe, mockMountApp } = vi.hoisted(
  () => {
    const mockRouterAfterEach = vi.fn();
    const mockRouterUnsubscribe = vi.fn();
    const mockMountApp = vi.fn();

    return {
      mockRouterAfterEach,
      mockRouterUnsubscribe,
      mockMountApp,
    };
  },
);

const routeState = reactive({
  name: 'settingsChannels',
  params: { internal: ['init'] },
  query: {},
});
const modelValueRef = ref(true);

function setRouteState({ name, params = {}, query = {} }) {
  routeState.name = name;
  routeState.params = params;
  routeState.query = query;
}

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountApp),
}));

vi.mock('@/store/Shared', () => ({
  useSharedStore: vi.fn().mockReturnValue({
    current: {
      project: { uuid: 'test-uuid' },
    },
    auth: {
      token: 'mock-token',
    },
    setIsActiveFederatedModule: vi.fn(),
  }),
}));

function ensureMountContainer(containerId) {
  if (!document.getElementById(containerId)) {
    const element = document.createElement('div');
    element.id = containerId;
    document.body.appendChild(element);
  }
}

function mockResolveRoute(target) {
  if (target?.name === 'home') {
    return { fullPath: '/rooms' };
  }

  if (target?.path?.startsWith('/')) {
    return { fullPath: target.path };
  }

  return { fullPath: `/${target?.path || ''}` };
}

function mountComposable(configOverrides = {}) {
  const containerId = configOverrides.containerId || 'integrations-app';
  ensureMountContainer(containerId);
  let afterEachCallback;
  let fedApi;
  const mockMountedAppUnmount = vi.fn();

  mockRouterAfterEach.mockImplementation((callback) => {
    afterEachCallback = callback;
    return mockRouterUnsubscribe;
  });

  mockMountApp.mockResolvedValue({
    app: { unmount: mockMountedAppUnmount },
    router: {
      afterEach: mockRouterAfterEach,
      replace: vi.fn(),
      resolve: vi.fn(mockResolveRoute),
      currentRoute: { value: { fullPath: '/' } },
    },
  });

  const Wrapper = defineComponent({
    setup() {
      fedApi = useFederatedModule({
        moduleName: 'settingsChannels',
        importFn: () => Promise.resolve(mockMountApp),
        importPath: 'integrations/main',
        containerId: 'integrations-app',
        routeNames: ['settingsChannels'],
        forceRemountEvent: 'forceRemountIntegrations',
        modelValue: modelValueRef,
        updateRoutePathPrefixes: ['integrations'],
        ...configOverrides,
      });

      return () => null;
    },
  });

  const wrapper = mount(Wrapper, { attachTo: document.body });

  return {
    wrapper,
    getAfterEachCallback: () => afterEachCallback,
    getFedApi: () => fedApi,
    mockMountedAppUnmount,
  };
}

describe('useFederatedModule setupRouterSync', () => {
  let wrapper;
  let getAfterEachCallback;
  let dispatchEventSpy;

  beforeEach(async () => {
    vi.clearAllMocks();
    modelValueRef.value = true;
    setRouteState({
      name: 'settingsChannels',
      params: { internal: ['init'] },
      query: {},
    });

    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    ({ wrapper, getAfterEachCallback } = mountComposable());
    await flushPromises();
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
    wrapper?.unmount();
    document.getElementById('integrations-app')?.remove();
  });

  it('dispatches updateRoute when host has no deep link', () => {
    const afterEachCallback = getAfterEachCallback();

    afterEachCallback({
      path: '/discovery',
      query: { filter: 'value1' },
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
  });

  it('skips default route sync while host deep link is not yet matched', async () => {
    wrapper.unmount();
    routeState.params.internal = ['apps', 'my'];

    ({ wrapper, getAfterEachCallback } = mountComposable());
    await flushPromises();

    const afterEachCallback = getAfterEachCallback();

    afterEachCallback({
      path: '/init',
      query: {},
    });

    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('stops skipping once module sync matches host deep link', async () => {
    wrapper.unmount();
    routeState.params.internal = ['apps', 'my'];

    ({ wrapper, getAfterEachCallback } = mountComposable());
    await flushPromises();

    const afterEachCallback = getAfterEachCallback();

    afterEachCallback({
      path: '/apps/my',
      query: {},
    });

    expect(dispatchEventSpy).not.toHaveBeenCalled();

    afterEachCallback({
      path: '/apps/other',
      query: { tab: '1' },
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'settingsChannels/apps/other',
          query: { tab: '1' },
        },
      }),
    );
  });
});

describe('useFederatedModule mount lifecycle', () => {
  let wrapper;
  let dispatchEventSpy;
  let resolveImport;
  let mockMountedAppUnmount;
  let getFedApi;
  let getAfterEachCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    modelValueRef.value = true;
    setRouteState({
      name: 'settingsChannels',
      params: { internal: ['init'] },
      query: {},
    });

    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    vi.mocked(tryImportWithRetries).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveImport = () => resolve(mockMountApp);
        }),
    );
  });

  afterEach(() => {
    vi.mocked(tryImportWithRetries).mockResolvedValue(mockMountApp);
    dispatchEventSpy.mockRestore();
    wrapper?.unmount();
    document.getElementById('integrations-app')?.remove();
  });

  it('aborts mount when user leaves module route before import completes', async () => {
    const mounted = mountComposable({
      activeModuleTracking: true,
      inactivityTimeout: 5 * 60 * 1000,
    });
    wrapper = mounted.wrapper;
    getFedApi = mounted.getFedApi;
    mockMountedAppUnmount = mounted.mockMountedAppUnmount;

    setRouteState({ name: 'settings', params: {}, query: {} });
    modelValueRef.value = false;

    resolveImport();
    await flushPromises();

    expect(getFedApi().app.value).toBe(null);
    expect(mockMountApp).not.toHaveBeenCalled();
    expect(mockMountedAppUnmount).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('does not dispatch updateRoute when host left module route', async () => {
    vi.mocked(tryImportWithRetries).mockResolvedValue(mockMountApp);

    const mounted = mountComposable();
    wrapper = mounted.wrapper;
    await flushPromises();

    dispatchEventSpy.mockClear();

    setRouteState({ name: 'settings', params: {}, query: {} });
    modelValueRef.value = false;

    const afterEachCallback = mounted.getAfterEachCallback();

    afterEachCallback({
      path: '/discovery',
      query: {},
    });

    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});

describe('useFederatedModule defaultHomeRoute sync', () => {
  let wrapper;
  let mockRouterReplace;

  beforeEach(async () => {
    vi.clearAllMocks();
    modelValueRef.value = true;
    mockRouterReplace = vi.fn();
    mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe);
    vi.mocked(tryImportWithRetries).mockResolvedValue(mockMountApp);

    mockMountApp.mockResolvedValue({
      app: { unmount: vi.fn() },
      router: {
        afterEach: mockRouterAfterEach,
        replace: mockRouterReplace,
        resolve: vi.fn(mockResolveRoute),
        currentRoute: {
          value: { fullPath: '/dashboard/manager' },
        },
      },
    });

    setRouteState({
      name: 'chats',
      params: { internal: ['init'] },
      query: {},
    });

    ensureMountContainer('chats-app');

    const Wrapper = defineComponent({
      setup() {
        useFederatedModule({
          moduleName: 'chats',
          importFn: () => Promise.resolve(mockMountApp),
          importPath: 'chats/main',
          containerId: 'chats-app',
          routeNames: ['chats'],
          forceRemountEvent: 'forceRemountChats',
          modelValue: modelValueRef,
          defaultHomeRoute: { name: 'home' },
          inactivityTimeout: 5 * 60 * 1000,
          activeModuleTracking: true,
        });

        return () => null;
      },
    });

    wrapper = mount(Wrapper, { attachTo: document.body });
    await flushPromises();
  });

  afterEach(() => {
    wrapper?.unmount();
    document.getElementById('chats-app')?.remove();
  });

  it('resets stale child routes when host lands on init', async () => {
    expect(mockRouterReplace).toHaveBeenCalledWith({ name: 'home', query: {} });

    mockRouterReplace.mockClear();

    setRouteState({
      name: 'insights',
      params: {},
      query: {},
    });
    await flushPromises();

    setRouteState({
      name: 'chats',
      params: { internal: ['init'] },
      query: {},
    });
    await flushPromises();

    expect(mockRouterReplace).toHaveBeenCalledWith({ name: 'home', query: {} });
  });
});

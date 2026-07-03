import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive, ref } from 'vue';
import { useChatsFederatedModule } from '../useChatsFederatedModule';
import { tryImportWithRetries } from '@/utils/moduleFederation';

const { mockRouterAfterEach, mockRouterUnsubscribe, mockMountApp, sharedStoreState } = vi.hoisted(
  () => {
    const mockRouterAfterEach = vi.fn();
    const mockRouterUnsubscribe = vi.fn();
    const mockMountApp = vi.fn();
    const sharedStoreState = {
      current: {
        project: { uuid: 'test-uuid' },
      },
      auth: {
        token: 'mock-token',
      },
      setIsActiveFederatedModule: vi.fn(),
    };

    return {
      mockRouterAfterEach,
      mockRouterUnsubscribe,
      mockMountApp,
      sharedStoreState,
    };
  },
);

const routeState = reactive({
  name: 'chats',
  params: { internal: ['init'] },
  query: {},
});
const modelValueRef = ref(true);

function mockResolveRoute(target) {
  if (target?.path === '/rooms') {
    return { fullPath: '/rooms' };
  }

  if (target?.path?.startsWith('/')) {
    return { fullPath: target.path };
  }

  if (target?.path?.startsWith('chats/')) {
    return { fullPath: `/${target.path}` };
  }

  return { fullPath: `/${target?.path || ''}` };
}

function setRouteState({ name, params = {}, query = {} }) {
  routeState.name = name;
  routeState.params = params;
  routeState.query = query;
}

function ensureMountContainer(containerId) {
  if (!document.getElementById(containerId)) {
    const element = document.createElement('div');
    element.id = containerId;
    document.body.appendChild(element);
  }
}

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountApp),
}));

vi.mock('@/store/Shared', () => ({
  useSharedStore: vi.fn(() => sharedStoreState),
}));

function mountComposable(configOverrides = {}) {
  const containerId = configOverrides.containerId || 'chats-app';
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
      fedApi = useChatsFederatedModule({
        moduleName: 'chats',
        importFn: () => Promise.resolve(mockMountApp),
        importPath: 'chats/main',
        containerId: 'chats-app',
        routeNames: ['chats'],
        forceRemountEvent: 'forceRemountChats',
        modelValue: modelValueRef,
        defaultHomeRoute: { path: '/rooms' },
        inactivityTimeout: 5 * 60 * 1000,
        activeModuleTracking: true,
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

describe('useChatsFederatedModule room path sync', () => {
  let wrapper;
  let getAfterEachCallback;
  let dispatchEventSpy;

  beforeEach(async () => {
    vi.clearAllMocks();
    sharedStoreState.auth.token = 'mock-token';
    sharedStoreState.current.project.uuid = 'test-uuid';
    modelValueRef.value = true;
    setRouteState({
      name: 'chats',
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
    document.getElementById('chats-app')?.remove();
  });

  it('prefixes room navigation symmetrically for the host URL', () => {
    const afterEachCallback = getAfterEachCallback();

    afterEachCallback({
      path: '/chats/room-uuid-123',
      query: {},
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'chats/chats/room-uuid-123',
          query: {},
        },
      }),
    );
  });

  it('does not echo updateRoute when host already matches the child path', () => {
    setRouteState({
      name: 'chats',
      params: { internal: ['chats', 'room-uuid-123'] },
      query: {},
    });

    dispatchEventSpy.mockClear();

    const afterEachCallback = getAfterEachCallback();

    afterEachCallback({
      path: '/chats/room-uuid-123',
      query: {},
    });

    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});

describe('useChatsFederatedModule defaultHomeRoute sync', () => {
  let wrapper;
  let mockRouterReplace;

  beforeEach(async () => {
    vi.clearAllMocks();
    sharedStoreState.auth.token = 'mock-token';
    sharedStoreState.current.project.uuid = 'test-uuid';
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
        useChatsFederatedModule({
          moduleName: 'chats',
          importFn: () => Promise.resolve(mockMountApp),
          importPath: 'chats/main',
          containerId: 'chats-app',
          routeNames: ['chats'],
          forceRemountEvent: 'forceRemountChats',
          modelValue: modelValueRef,
          defaultHomeRoute: { path: '/rooms' },
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
    expect(mockRouterReplace).toHaveBeenCalledWith({
      path: '/rooms',
      query: {},
    });

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

    expect(mockRouterReplace).toHaveBeenCalledWith({
      path: '/rooms',
      query: {},
    });
  });

  it('pushes host room deep links into the child router', async () => {
    mockRouterReplace.mockClear();

    setRouteState({
      name: 'chats',
      params: { internal: ['chats', 'room-uuid-789'] },
      query: {},
    });
    await flushPromises();

    expect(mockRouterReplace).toHaveBeenCalledWith({
      path: 'chats/room-uuid-789',
      query: {},
    });
  });

  it('retries mount when auth prerequisites become available', async () => {
    vi.mocked(tryImportWithRetries).mockClear();
    mockMountApp.mockClear();
    wrapper.unmount();
    document.getElementById('chats-app')?.remove();

    sharedStoreState.auth.token = null;
    sharedStoreState.current.project.uuid = null;

    const Wrapper = defineComponent({
      setup() {
        useChatsFederatedModule({
          moduleName: 'chats',
          importFn: () => Promise.resolve(mockMountApp),
          importPath: 'chats/main',
          containerId: 'chats-app',
          routeNames: ['chats'],
          forceRemountEvent: 'forceRemountChats',
          modelValue: modelValueRef,
          defaultHomeRoute: { path: '/rooms' },
        });

        return () => null;
      },
    });

    const lateWrapper = mount(Wrapper, { attachTo: document.body });
    await flushPromises();

    expect(tryImportWithRetries).not.toHaveBeenCalled();

    ensureMountContainer('chats-app');
    sharedStoreState.auth.token = 'mock-token';
    sharedStoreState.current.project.uuid = 'test-uuid';
    await flushPromises();

    expect(tryImportWithRetries).toHaveBeenCalled();
    expect(mockMountApp).toHaveBeenCalled();

    lateWrapper.unmount();
  });

  it('keeps the mounted app when modelValue is true but the host route name does not match', async () => {
    wrapper.unmount();
    document.getElementById('chats-app')?.remove();

    const mockMountedAppUnmount = vi.fn();
    let fedApi;

    mockMountApp.mockResolvedValue({
      app: { unmount: mockMountedAppUnmount },
      router: {
        afterEach: mockRouterAfterEach,
        replace: vi.fn(),
        resolve: vi.fn(mockResolveRoute),
        currentRoute: { value: { fullPath: '/' } },
      },
    });

    setRouteState({
      name: 'insights',
      params: {},
      query: {},
    });
    modelValueRef.value = true;
    ensureMountContainer('chats-app');

    const Wrapper = defineComponent({
      setup() {
        fedApi = useChatsFederatedModule({
          moduleName: 'chats',
          importFn: () => Promise.resolve(mockMountApp),
          importPath: 'chats/main',
          containerId: 'chats-app',
          routeNames: ['chats'],
          forceRemountEvent: 'forceRemountChats',
          modelValue: modelValueRef,
          defaultHomeRoute: { path: '/rooms' },
        });

        return () => null;
      },
    });

    const mismatchWrapper = mount(Wrapper, { attachTo: document.body });
    await flushPromises();

    expect(fedApi.app.value).toBeTruthy();
    expect(mockMountedAppUnmount).not.toHaveBeenCalled();

    mismatchWrapper.unmount();
    document.getElementById('chats-app')?.remove();
  });
});

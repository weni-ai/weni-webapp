import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useFederatedModule } from '../useFederatedModule';

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

const routeRef = ref({
  name: 'settingsChannels',
  params: { internal: ['init'] },
  query: {},
});
const modelValueRef = ref(true);

vi.mock('vue-router', () => ({
  useRoute: () => routeRef.value,
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

function mountComposable(configOverrides = {}) {
  let afterEachCallback;

  mockRouterAfterEach.mockImplementation((callback) => {
    afterEachCallback = callback;
    return mockRouterUnsubscribe;
  });

  mockMountApp.mockResolvedValue({
    app: { unmount: vi.fn() },
    router: {
      afterEach: mockRouterAfterEach,
      replace: vi.fn(),
    },
  });

  const Wrapper = defineComponent({
    setup() {
      useFederatedModule({
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

  const wrapper = mount(Wrapper);

  return { wrapper, getAfterEachCallback: () => afterEachCallback };
}

describe('useFederatedModule setupRouterSync', () => {
  let wrapper;
  let getAfterEachCallback;
  let dispatchEventSpy;

  beforeEach(async () => {
    vi.clearAllMocks();
    modelValueRef.value = true;
    routeRef.value = {
      name: 'settingsChannels',
      params: { internal: ['init'] },
      query: {},
    };

    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    ({ wrapper, getAfterEachCallback } = mountComposable());
    await flushPromises();
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
    wrapper?.unmount();
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
    routeRef.value.params.internal = ['apps', 'my'];

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
    routeRef.value.params.internal = ['apps', 'my'];

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

import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useChatsModuleUpdateRoute } from '../useChatsModuleUpdateRoute';

const mockReplace = vi.fn().mockResolvedValue(undefined);
const routeRef = ref({
  name: 'chats',
  params: {
    projectUuid: 'test-project-uuid',
    internal: ['chats', 'room-uuid-123'],
  },
  query: {},
});

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useRoute: () => routeRef.value,
}));

function mountComposable(routeName, options = {}) {
  let api;

  const Wrapper = defineComponent({
    setup() {
      api = useChatsModuleUpdateRoute(routeName, options);
      return () => null;
    },
  });

  const wrapper = mount(Wrapper);

  return { wrapper, api };
}

describe('useChatsModuleUpdateRoute', () => {
  let wrapper;
  let getInitialModuleRoute;

  beforeEach(() => {
    vi.clearAllMocks();
    routeRef.value = {
      name: 'chats',
      params: {
        projectUuid: 'test-project-uuid',
        internal: ['chats', 'room-uuid-123'],
      },
      query: {},
    };

    ({ wrapper, api: { getInitialModuleRoute } } = mountComposable('chats'));
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('reconstructs room deep links for the child router', () => {
    expect(getInitialModuleRoute()).toEqual({
      path: 'chats/room-uuid-123',
      query: {},
    });
  });

  it('returns undefined for init-only live-desk host paths', () => {
    routeRef.value.params.internal = ['init'];

    expect(getInitialModuleRoute()).toBeUndefined();
  });

  it('builds a named view-mode route for insights redirects', () => {
    routeRef.value.params.internal = [
      'dashboard',
      'view-mode',
      'marcus.vinicius@weni.ai',
      'insights',
    ];
    routeRef.value.query = { uuid_room: 'room-uuid-456' };

    expect(getInitialModuleRoute()).toEqual({
      name: 'dashboard.view-mode',
      params: {
        viewedAgent: 'marcus.vinicius@weni.ai',
        oldModule: 'insights',
      },
      query: { uuid_room: 'room-uuid-456' },
    });
  });

  it('lands on basePath for settings mounts', () => {
    wrapper.unmount();
    routeRef.value = {
      name: 'settingsChats',
      params: { internal: ['init'] },
      query: {},
    };

    ({ wrapper, api: { getInitialModuleRoute } } = mountComposable(
      'settingsChats',
      { basePath: '/settings' },
    ));

    expect(getInitialModuleRoute()).toEqual({
      path: '/settings',
      query: {},
    });
  });

  it('forwards the Desk Copilot tab query when settings lands on init', () => {
    wrapper.unmount();
    routeRef.value = {
      name: 'settingsChats',
      params: { internal: ['init'] },
      query: { tab: 'desk_copilot' },
    };

    ({ wrapper, api: { getInitialModuleRoute } } = mountComposable(
      'settingsChats',
      { basePath: '/settings' },
    ));

    expect(getInitialModuleRoute()).toEqual({
      path: '/settings',
      query: { tab: 'desk_copilot' },
    });
  });

  it('forwards the tab query when settings has no internal path', () => {
    wrapper.unmount();
    routeRef.value = {
      name: 'settingsChats',
      params: { internal: [] },
      query: { tab: 'desk_copilot' },
    };

    ({ wrapper, api: { getInitialModuleRoute } } = mountComposable(
      'settingsChats',
      { basePath: '/settings' },
    ));

    expect(getInitialModuleRoute()).toEqual({
      path: '/settings',
      query: { tab: 'desk_copilot' },
    });
  });

  it('resolves settings deep links relative to basePath', () => {
    wrapper.unmount();
    routeRef.value = {
      name: 'settingsChats',
      params: { internal: ['sectors', 'new'] },
      query: {},
    };

    ({ wrapper, api: { getInitialModuleRoute } } = mountComposable(
      'settingsChats',
      { basePath: '/settings' },
    ));

    expect(getInitialModuleRoute()).toEqual({
      path: '/settings/sectors/new',
      query: {},
    });
  });

  it('syncs room paths from chats-prefixed updateRoute events', () => {
    routeRef.value.params.internal = ['init'];

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: 'chats/chats/room-uuid-456',
          query: { uuid_room: 'room-uuid-456' },
        },
      }),
    );

    expect(mockReplace).toHaveBeenCalledWith({
      name: 'chats',
      params: {
        projectUuid: 'test-project-uuid',
        internal: ['chats', 'room-uuid-456'],
      },
      query: { uuid_room: 'room-uuid-456' },
    });
  });

  it('does not replace when the host already matches the incoming path', () => {
    routeRef.value.params.internal = ['chats', 'room-uuid-123'];

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: 'chats/chats/room-uuid-123',
          query: {},
        },
      }),
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('keeps deep links when the child reports init on mount', () => {
    routeRef.value.params.internal = ['chats', 'room-uuid-123'];

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: { path: 'chats/init', query: {} },
      }),
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });
});

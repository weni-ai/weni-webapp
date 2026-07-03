import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useChatsModuleUpdateRoute } from '../useChatsModuleUpdateRoute';

const mockReplace = vi.fn();
const routeRef = ref({
  name: 'chats',
  params: { internal: ['chats', 'room-uuid-123'] },
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
      params: { internal: ['chats', 'room-uuid-123'] },
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
      params: { internal: ['chats', 'room-uuid-456'] },
      query: { uuid_room: 'room-uuid-456' },
    });
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

import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import {
  normalizeInternalPath,
  useModuleUpdateRoute,
} from '../useModuleUpdateRoute';

const mockReplace = vi.fn();
const routeRef = ref({
  name: 'settingsChannels',
  params: { internal: ['apps', 'my'] },
  query: {},
});

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useRoute: () => routeRef.value,
}));

function mountComposable() {
  let api;

  const Wrapper = defineComponent({
    setup() {
      api = useModuleUpdateRoute('settingsChannels');
      return () => null;
    },
  });

  const wrapper = mount(Wrapper);

  return { wrapper, api };
}

describe('normalizeInternalPath', () => {
  it('strips remount prefix from path segments', () => {
    expect(normalizeInternalPath(['r', 'init'])).toBe('init');
    expect(normalizeInternalPath('r/apps/my')).toBe('apps/my');
  });

  it('keeps deep link paths unchanged', () => {
    expect(normalizeInternalPath(['apps', 'my'])).toBe('apps/my');
  });
});

describe('useModuleUpdateRoute', () => {
  let wrapper;
  let getInitialModuleRoute;

  beforeEach(() => {
    vi.clearAllMocks();
    routeRef.value = {
      params: { internal: ['apps', 'my'] },
      query: {},
    };

    ({ wrapper, api: { getInitialModuleRoute } } = mountComposable());
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('returns initial route for deep links', () => {
    expect(getInitialModuleRoute()).toEqual({
      path: 'apps/my',
      query: {},
    });
  });

  it('returns undefined for init-only host paths', () => {
    routeRef.value.params.internal = ['init'];

    expect(getInitialModuleRoute()).toBeUndefined();
  });

  it('normalizes remount paths for the federated app', () => {
    routeRef.value.params.internal = ['r', 'init'];

    expect(getInitialModuleRoute()).toBeUndefined();
  });

  it('accepts integrations-prefixed updateRoute events', () => {
    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: { path: 'integrations/discovery', query: {} },
      }),
    );

    expect(mockReplace).toHaveBeenCalledWith({
      name: 'settingsChannels',
      params: { internal: ['discovery'] },
      query: {},
    });
  });

  it('does not replace a deep link with init from module sync', () => {
    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: { path: 'settingsChannels/init', query: {} },
      }),
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not replace a deep link with apps/discovery from module sync', () => {
    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: { path: 'apps/discovery', query: {} },
      }),
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('parses bare subpaths without module prefix', () => {
    routeRef.value.params.internal = ['init'];

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: 'apps/my/configured/wwc/uuid',
          query: {},
        },
      }),
    );

    expect(mockReplace).toHaveBeenCalledWith({
      name: 'settingsChannels',
      params: {
        internal: [
          'apps',
          'my',
          'configured',
          'wwc',
          'uuid',
        ],
      },
      query: {},
    });
  });

  it('syncs nested paths from settingsChannels-prefixed events', () => {
    routeRef.value.params.internal = ['init'];

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: { path: 'settingsChannels/apps/my', query: { tab: '1' } },
      }),
    );

    expect(mockReplace).toHaveBeenCalledWith({
      name: 'settingsChannels',
      params: { internal: ['apps', 'my'] },
      query: { tab: '1' },
    });
  });
});

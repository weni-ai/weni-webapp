import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import {
  normalizeInternalPath,
  parseInternalFromEventPath,
} from '@/utils/normalizeInternalPath';

export { normalizeInternalPath, parseInternalFromEventPath };

/** Default landing paths reported by federated modules on mount. */
const MODULE_DEFAULT_HOME_PATHS = new Set(['init', 'apps/discovery']);

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string} routeName - The name of the route to navigate to
 * @param {Object} [options]
 * @param {string} [options.basePath] - Module-internal base path for this host
 *   route instance (e.g. `/settings`). When set, the initial route lands on this
 *   base (instead of the module default home) and deep links are resolved
 *   relative to it.
 * @param {string[]} [options.eventPathPrefixes=[]] - Additional path prefixes accepted in updateRoute events
 * @param {Function} [options.shouldSyncHostRoute] - When provided, host navigation runs only if this returns true
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(
  routeName,
  { basePath = '', eventPathPrefixes = [], shouldSyncHostRoute } = {},
) {
  const router = useRouter();
  const route = useRoute();
  const acceptedPrefixes = [routeName, ...eventPathPrefixes];
  const normalizedBasePath = basePath.replace(/\/+$/u, '');

  const handleUpdateRoute = (event) => {
    const eventPath = event.detail?.path;

    if (
      !eventPath ||
      !acceptedPrefixes.some((prefix) => eventPath.includes(prefix))
    ) {
      return;
    }

    let path = parseInternalFromEventPath(eventPath, acceptedPrefixes);

    if (path[0] === 'r') {
      path = path.slice(1);
    }

    if (!path.length) {
      return;
    }

    if (shouldSyncHostRoute && !shouldSyncHostRoute()) {
      return;
    }

    const incomingPath = path.join('/');
    const currentPath = normalizeInternalPath(route?.params?.internal);

    // Keep deep links when the federated app reports its default route on mount.
    if (
      MODULE_DEFAULT_HOME_PATHS.has(incomingPath) &&
      currentPath &&
      !MODULE_DEFAULT_HOME_PATHS.has(currentPath) &&
      !currentPath.startsWith('r/')
    ) {
      return;
    }

    // `router` can be undefined when this window-level handler fires while the
    // owning FederatedModule is being torn down (the module router's afterEach
    // outlives the host component context). Guard so a late event can't crash.
    router?.replace({
      name: routeName,
      params: {
        internal: path,
      },
      query: event.detail?.query,
    });
  };

  function getInitialModuleRoute() {
    const pathPart = normalizeInternalPath(route?.params?.internal);

    if (!pathPart || pathPart === 'init') {
      // Based instances (e.g. settings) must land on their base route so the
      // module renders the requested section instead of its default home.
      return normalizedBasePath
        ? { path: normalizedBasePath, query: route?.query || {} }
        : undefined;
    }

    const fullPath = normalizedBasePath
      ? `${normalizedBasePath}/${pathPart}`
      : pathPart;

    return { path: fullPath, query: route?.query || {} };
  }

  onMounted(() => {
    window.addEventListener('updateRoute', handleUpdateRoute);
  });

  onUnmounted(() => {
    window.removeEventListener('updateRoute', handleUpdateRoute);
  });

  return {
    getInitialModuleRoute,
  };
}

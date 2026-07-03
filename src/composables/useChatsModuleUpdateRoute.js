import { getCurrentInstance, onMounted, onUnmounted, unref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import {
  normalizeInternalPath,
  parseInternalFromEventPath,
} from '@/utils/normalizeInternalPath';

export { normalizeInternalPath, parseInternalFromEventPath };

/** Default landing paths reported by federated modules on mount. */
const MODULE_DEFAULT_HOME_PATHS = new Set(['init', 'apps/discovery']);

/**
 * Chats-only route sync between the federated chats remote and the connect host.
 * Forked from useModuleUpdateRoute so legacy modules (bulkSend, insights, etc.)
 * are not affected by chats-specific routing behavior.
 */
export function useChatsModuleUpdateRoute(
  routeName,
  { basePath = '', eventPathPrefixes = [], shouldSyncHostRoute, hostRoute } = {},
) {
  const router = useRouter();
  const injectedRoute = useRoute();
  const componentInstance = getCurrentInstance();

  function getHostRoute() {
    const resolvedHostRoute = unref(hostRoute);

    if (resolvedHostRoute?.name) {
      return resolvedHostRoute;
    }

    if (injectedRoute?.name) {
      return injectedRoute;
    }

    return componentInstance?.proxy?.$route ?? injectedRoute;
  }
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
    const currentPath = normalizeInternalPath(
      getHostRoute()?.params?.internal,
    );

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
    const pathPart = normalizeInternalPath(
      getHostRoute()?.params?.internal,
    );

    if (!pathPart || pathPart === 'init') {
      // Based instances (e.g. settings) must land on their base route so the
      // module renders the requested section instead of its default home.
      return normalizedBasePath
        ? { path: normalizedBasePath, query: getHostRoute()?.query || {} }
        : undefined;
    }

    const fullPath = normalizedBasePath
      ? `${normalizedBasePath}/${pathPart}`
      : pathPart;

    return { path: fullPath, query: getHostRoute()?.query || {} };
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

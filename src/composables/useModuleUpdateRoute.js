import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const MODULE_PATH_PREFIXES = ['settingsChannels', 'integrations'];

/**
 * Strips the host-only `r/` remount prefix from internal path segments.
 * @param {string|string[]|undefined} internal
 * @returns {string}
 */
export function normalizeInternalPath(internal) {
  const pathPart = Array.isArray(internal)
    ? internal.join('/')
    : internal || '';

  if (pathPart.startsWith('r/')) {
    return pathPart.slice(2);
  }

  return pathPart;
}

/**
 * @param {string} eventPath
 * @returns {string[]}
 */
function parseModuleInternalSegments(eventPath) {
  if (!eventPath) {
    return [];
  }

  for (const prefix of MODULE_PATH_PREFIXES) {
    if (eventPath === prefix) {
      return [];
    }

    if (eventPath.startsWith(`${prefix}/`)) {
      return eventPath.slice(prefix.length + 1).split('/').filter(Boolean);
    }
  }

  return [];
}

/**
 * @param {string} eventPath
 * @param {string[]} routeNames
 * @returns {boolean}
 */
function isModuleRouteEvent(eventPath, routeNames) {
  if (!eventPath) {
    return false;
  }

  return routeNames.some((name) => eventPath.includes(name));
}

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string} routeName - The name of the route to navigate to
 * @param {object} [options]
 * @param {string[]} [options.routeAliases] - Additional path prefixes accepted in updateRoute events
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(routeName, options = {}) {
  const router = useRouter();
  const route = useRoute();

  const acceptedRouteNames = [
    routeName,
    ...(options.routeAliases ?? []),
    ...(routeName === 'settingsChannels' ? ['integrations'] : []),
  ];

  const handleUpdateRoute = (event) => {
    if (!isModuleRouteEvent(event.detail?.path, acceptedRouteNames)) {
      return;
    }

    let path = parseModuleInternalSegments(event.detail.path);

    if (path[0] === 'r') {
      path = path.slice(1);
    }

    if (!path.length) {
      return;
    }

    const incomingPath = path.join('/');
    const currentPath = normalizeInternalPath(route?.params?.internal);

    // Keep deep links when the federated app reports its default route on mount.
    if (
      incomingPath === 'init' &&
      currentPath &&
      currentPath !== 'init' &&
      !currentPath.startsWith('r/')
    ) {
      return;
    }

    router.replace({
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
      return undefined;
    }

    return { path: pathPart, query: route?.query || {} };
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

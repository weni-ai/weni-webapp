import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

/** Default landing paths reported by federated modules on mount. */
const MODULE_DEFAULT_HOME_PATHS = new Set(['init', 'apps/discovery']);

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
 * @param {string} routeName
 * @returns {string[]}
 */
function getAcceptedPathPrefixes(routeName) {
  const prefixes = [routeName];

  if (routeName === 'settingsChannels') {
    prefixes.push('integrations');
  }

  return prefixes;
}

/**
 * @param {string} eventPath
 * @param {string[]} prefixes
 * @returns {string[]}
 */
function parseInternalFromEventPath(eventPath, prefixes) {
  if (!eventPath) {
    return [];
  }

  for (const prefix of prefixes) {
    if (eventPath === prefix) {
      return [];
    }

    if (eventPath.startsWith(`${prefix}/`)) {
      return eventPath
        .slice(prefix.length + 1)
        .split('/')
        .filter(Boolean);
    }
  }

  return [];
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isModuleDefaultHome(path) {
  return MODULE_DEFAULT_HOME_PATHS.has(path);
}

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string} routeName - The name of the route to navigate to
 * @param {object} [options]
 * @param {string} [options.basePath] - Module-internal base path for this host
 *   route instance (e.g. `/settings`). When set, the initial route lands on this
 *   base (instead of the module default home) and deep links are resolved
 *   relative to it.
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(routeName, { basePath = '' } = {}) {
  const router = useRouter();
  const route = useRoute();
  const acceptedPrefixes = getAcceptedPathPrefixes(routeName);
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

    const incomingPath = path.join('/');
    const currentPath = normalizeInternalPath(route?.params?.internal);

    // Keep deep links when the federated app reports its default route on mount.
    if (
      isModuleDefaultHome(incomingPath) &&
      currentPath &&
      !isModuleDefaultHome(currentPath) &&
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

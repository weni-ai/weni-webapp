import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

/**
 * Normalizes host route internal params into an absolute module path.
 * Strips iframe force-reload prefix (r/) and ignores default init paths.
 *
 * @param {string|string[]|undefined} internal - Route internal param
 * @returns {string|undefined} Absolute path (e.g. '/apps/my') or undefined for default
 */
export function normalizeModuleInternalPath(internal) {
  let pathPart = Array.isArray(internal)
    ? internal.join('/')
    : internal || '';

  if (pathPart.startsWith('r/')) {
    pathPart = pathPart.slice(2);
  }

  if (!pathPart || pathPart === 'init' || pathPart === 'init/force') {
    return undefined;
  }

  return pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
}

function queriesMatch(queryA = {}, queryB = {}) {
  const keysA = Object.keys(queryA);
  const keysB = Object.keys(queryB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => queryA[key] === queryB[key]);
}

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string} routeName - The name of the route to navigate to
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(routeName) {
  const router = useRouter();
  const route = useRoute();

  const handleUpdateRoute = (event) => {
    if (!event.detail?.path?.includes(routeName)) {
      return;
    }

    const eventInternalSegments = event.detail.path
      .split('/')
      .slice(1)
      .filter((item) => item);

    const normalizedEventPath = normalizeModuleInternalPath(
      eventInternalSegments,
    );

    if (!normalizedEventPath) {
      return;
    }

    const normalizedCurrentPath = normalizeModuleInternalPath(
      route?.params?.internal,
    );

    if (
      normalizedEventPath === normalizedCurrentPath &&
      queriesMatch(event.detail?.query, route?.query)
    ) {
      return;
    }

    router
      .replace({
        name: routeName,
        params: {
          ...route.params,
          internal: normalizedEventPath.replace(/^\//, '').split('/'),
        },
        query: event.detail?.query ?? route.query,
      })
      .catch((error) => {
        if (error?.name !== 'NavigationDuplicated') {
          throw error;
        }
      });
  };

  function getInitialModuleRoute() {
    const normalizedPath = normalizeModuleInternalPath(route?.params?.internal);

    return normalizedPath
      ? { path: normalizedPath, query: route?.query || {} }
      : undefined;
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

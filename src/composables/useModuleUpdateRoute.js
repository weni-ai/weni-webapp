import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import {
  normalizeInternalPath,
  parseInternalFromEventPath,
} from '@/utils/normalizeInternalPath';

export { normalizeInternalPath, parseInternalFromEventPath };

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string} routeName - The name of the route to navigate to
 * @param {Object} [options]
 * @param {string[]} [options.eventPathPrefixes=[]] - Additional path prefixes accepted in updateRoute events
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(routeName, { eventPathPrefixes = [] } = {}) {
  const router = useRouter();
  const route = useRoute();
  const acceptedPrefixes = [routeName, ...eventPathPrefixes];

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

import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string} routeName - The name of the route to navigate to
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(routeName) {
  const router = useRouter();
  const route = useRoute();

  const handleUpdateRoute = (event) => {
    if (!event.detail.path.includes(routeName)) {
      return;
    }

    const path = event.detail.path
      .split('/')
      .slice(1)
      .filter((item) => item);

    if (path.length) {
      router.replace({
        name: routeName,
        params: {
          internal: path,
        },
        query: event.detail?.query,
      });
    }
  };

  function getInitialModuleRoute() {
    const pathPart = Array.isArray(route.params.internal)
      ? route.params.internal.join('/')
      : route.params.internal || '';

    return pathPart ? { path: pathPart, query: route.query || {} } : undefined;
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

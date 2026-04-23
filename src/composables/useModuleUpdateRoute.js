import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

/**
 * Composable to handle updateRoute window events and extract initial module route
 * @param {string|string[]} routeNameOrNames - The name (or list of names) of the host route(s) to navigate to
 * @returns {object} - Object containing getInitialModuleRoute function
 */
export function useModuleUpdateRoute(routeNameOrNames) {
  const router = useRouter();
  const route = useRoute();

  const routeNames = Array.isArray(routeNameOrNames)
    ? routeNameOrNames
    : [routeNameOrNames];

  const handleUpdateRoute = (event) => {
    const targetName = event.detail?.name;

    const matchesRouteName = targetName
      ? routeNames.includes(targetName)
      : routeNames.some((name) => event.detail.path.includes(name));

    if (!matchesRouteName) {
      return;
    }

    const path = event.detail.path
      .split('/')
      .slice(1)
      .filter((item) => item);

    if (path.length) {
      router.replace({
        name: targetName || routeNames[0],
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

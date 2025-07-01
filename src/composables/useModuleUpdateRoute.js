import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Composable to handle updateRoute window events
 * @param {string} routeName - The name of the route to navigate to
 * @returns {void}
 */
export function useModuleUpdateRoute(routeName) {
  const router = useRouter();

  const handleUpdateRoute = (event) => {
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

  onMounted(() => {
    window.addEventListener('updateRoute', handleUpdateRoute);
  });

  onUnmounted(() => {
    window.removeEventListener('updateRoute', handleUpdateRoute);
  });
}

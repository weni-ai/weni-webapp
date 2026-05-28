import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';

import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedProjectContext } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';

/**
 * Composable for managing federated module lifecycle.
 *
 * Handles mounting/unmounting of remote modules via Module Federation,
 * with optional iframe fallback, inactivity timeout, and active module tracking.
 *
 * @param {Object} config - Configuration for the federated module
 * @param {string} config.moduleName - Module identifier (e.g., 'insights')
 * @param {Function} config.importFn - Dynamic import function for the remote module
 * @param {string} config.importPath - Import path for logging/retry purposes
 * @param {string} config.containerId - DOM element ID for mounting the remote app
 * @param {string[]} config.routeNames - Route names associated with this module
 * @param {string} config.forceRemountEvent - Window event name to trigger force remount
 * @param {import('vue').Ref<boolean>} config.modelValue - Reactive ref controlling mount/visibility
 * @param {boolean} [config.iframeFallback=false] - Fall back to iframe if federation fails
 * @param {boolean} [config.initialUseIframe=false] - Start in iframe-only mode
 * @param {number|null} [config.inactivityTimeout=null] - Ms before unmount on inactivity (null = disabled)
 * @param {boolean} [config.activeModuleTracking=false] - Track active state via sharedStore
 * @param {string} [config.routeNameForUpdateRoute] - Override route name for useModuleUpdateRoute (defaults to moduleName)
 * @param {Object} [config.remountRoute] - Route target before remount (defaults to { name: 'home' })
 * @param {import('vue').Ref<HTMLElement|null>} [config.containerRef] - Template ref to mount container
 * @returns {Object} Reactive state and lifecycle functions for the federated module
 */
export function useFederatedModule(config) {
  const {
    moduleName,
    importFn,
    importPath,
    containerId,
    routeNames,
    forceRemountEvent,
    modelValue,
    iframeFallback = false,
    initialUseIframe = false,
    inactivityTimeout = null,
    activeModuleTracking = false,
    routeNameForUpdateRoute,
    remountRoute,
    containerRef,
  } = config;

  const route = useRoute();
  const { sharedStore, projectUuid, canLoadFederatedModule } =
    useSharedProjectContext();

  // --- Reactive State ---

  const app = ref(null);
  const moduleRouter = ref(null);
  const routerUnsubscribe = ref(null);
  const useIframe = ref(initialUseIframe);
  const iframeRef = ref(null);
  const isMounting = ref(false);
  const unmountTimeoutId = ref(null);
  const mountRetryTimeoutId = ref(null);

  const isModuleRoute = computed(() => routeNames.includes(route?.name));
  const isHostMounted = ref(false);

  const { getInitialModuleRoute } = useModuleUpdateRoute(
    routeNameForUpdateRoute || moduleName,
  );

  function canMountModule() {
    return canLoadFederatedModule.value;
  }

  function scheduleMount() {
    if (!isHostMounted.value || !unref(modelValue) || app.value || isMounting.value) {
      return;
    }

    mount();
  }

  function scheduleMountRetry() {
    if (mountRetryTimeoutId.value) {
      return;
    }

    mountRetryTimeoutId.value = setTimeout(() => {
      mountRetryTimeoutId.value = null;
      scheduleMount();
    }, 100);
  }

  // --- Core Functions ---

  /**
   * Set up router synchronization between the module's internal router and the
   * host application. Dispatches an 'updateRoute' CustomEvent on every module
   * navigation so the host router can stay in sync.
   */
  function setupRouterSync() {
    if (routerUnsubscribe.value) {
      routerUnsubscribe.value();
    }

    if (!moduleRouter.value) {
      return;
    }

    routerUnsubscribe.value = moduleRouter.value.afterEach((to) => {
      window.dispatchEvent(
        new CustomEvent('updateRoute', {
          detail: {
            path: `${moduleName}${to.path}`,
            query: to.query || {},
          },
        }),
      );
    });
  }

  /**
   * Mount the federated module or initialize the iframe fallback.
   * Includes a concurrency guard (isMounting) to prevent overlapping mounts.
   *
   * @param {Object} [options]
   * @param {boolean} [options.force=false] - Mount even if modelValue is false
   */
  async function resolveMountContainer() {
    for (let attempt = 0; attempt < 20; attempt++) {
      await nextTick();

      if (containerRef?.value) {
        return containerRef.value;
      }

      const element = document.getElementById(containerId);

      if (element) {
        return element;
      }
    }

    return null;
  }

  async function mount({ force = false } = {}) {
    if ((!force && !unref(modelValue)) || isMounting.value) {
      return;
    }

    // In iframe mode, initialize the iframe and return early
    if (useIframe.value) {
      await nextTick();
      iframeRef.value?.init();
      return;
    }

    if (!canMountModule()) {
      return;
    }

    isMounting.value = true;

    try {
      const [mountApp, mountContainer] = await Promise.all([
        tryImportWithRetries(importFn, importPath),
        resolveMountContainer(),
      ]);

      if (!mountApp) {
        if (iframeFallback) {
          fallbackToIframe();
        } else {
          console.error(`Failed to mount ${moduleName} app`);
        }
        return;
      }

      if (!mountContainer) {
        console.warn(`Mount container #${containerId} not found`);
        scheduleMountRetry();
        return;
      }

      const initialRoute = getInitialModuleRoute();

      const { app: mountedApp, router: mountedRouter } = await mountApp({
        containerId,
        initialRoute,
      });

      app.value = mountedApp;
      moduleRouter.value = mountedRouter;

      if (activeModuleTracking && isModuleRoute.value) {
        sharedStore.setIsActiveFederatedModule(moduleName, true);
      }

      setupRouterSync();
    } catch (error) {
      console.error(`Failed to mount ${moduleName} app`, error);

      if (iframeFallback) {
        fallbackToIframe();
      }
    } finally {
      isMounting.value = false;
    }
  }

  /**
   * Switch to iframe fallback mode. Called automatically when module federation
   * import fails and iframeFallback is enabled.
   */
  function fallbackToIframe() {
    useIframe.value = true;
    nextTick(() => {
      iframeRef.value?.init(route?.params);
    });
  }

  /**
   * Unmount the federated module and clean up all resources including
   * router subscriptions, timeouts, and active module tracking.
   */
  function unmount() {
    if (unmountTimeoutId.value) {
      clearTimeout(unmountTimeoutId.value);
      unmountTimeoutId.value = null;
    }

    if (activeModuleTracking) {
      sharedStore.setIsActiveFederatedModule(moduleName, false);
    }

    if (routerUnsubscribe.value) {
      routerUnsubscribe.value();
      routerUnsubscribe.value = null;
    }

    if (useIframe.value) {
      iframeRef.value?.reset();
    } else {
      app.value?.unmount();
      app.value = null;
      moduleRouter.value = null;
    }
  }

  /**
   * Remount the federated module by navigating to home, unmounting,
   * and then mounting again with force.
   */
  async function remount() {
    if (moduleRouter.value) {
      await moduleRouter.value.replace(remountRoute || { name: 'home' });
    }
    unmount();
    await nextTick();
    mount({ force: true });
  }

  async function syncModuleRoute() {
    if (
      !app.value ||
      !moduleRouter.value ||
      useIframe.value ||
      isMounting.value
    ) {
      return;
    }

    const initialRoute = getInitialModuleRoute();

    if (!initialRoute) {
      return;
    }

    try {
      await moduleRouter.value.replace(initialRoute);
    } catch (error) {
      if (error?.name !== 'NavigationDuplicated') {
        console.error(`Failed to sync ${moduleName} route`, error);
      }
    }
  }

  // --- Watchers ---

  // Auto-mount when modelValue becomes true (after host is mounted)
  watch(
    () => unref(modelValue),
    () => {
      scheduleMount();
    },
  );

  // Retry mount when auth/project context becomes available
  watch(
    () => [
      sharedStore.auth.token,
      projectUuid.value,
      route.params?.projectUuid,
    ],
    () => {
      scheduleMount();
    },
  );

  watch(
    () => containerRef?.value,
    () => {
      scheduleMount();
    },
  );

  // Sync module router when host internal path changes
  watch(
    () => route.params?.internal,
    () => {
      syncModuleRoute();
    },
    { deep: true },
  );

  // Reset or unmount on project change
  watch(
    () => projectUuid.value,
    (newProjectUuid, oldProjectUuid) => {
      if (newProjectUuid !== oldProjectUuid) {
        if (useIframe.value) {
          iframeRef.value?.reset();
        } else {
          unmount();
        }
      }
    },
  );

  // Inactivity timeout and/or active module tracking on route transitions
  if (inactivityTimeout !== null || activeModuleTracking) {
    watch(
      () => route?.name,
      (newRoute, oldRoute) => {
        const wasModuleRoute = routeNames.includes(oldRoute);
        const isCurrentModuleRoute = routeNames.includes(newRoute);

        // Leaving the module route
        if (
          wasModuleRoute &&
          !isCurrentModuleRoute &&
          app.value &&
          !useIframe.value
        ) {
          if (activeModuleTracking) {
            sharedStore.setIsActiveFederatedModule(moduleName, false);
          }

          if (inactivityTimeout !== null) {
            unmountTimeoutId.value = setTimeout(() => {
              unmount();
            }, inactivityTimeout);
          }
        }

        // Entering the module route
        if (!wasModuleRoute && isCurrentModuleRoute) {
          if (unmountTimeoutId.value) {
            clearTimeout(unmountTimeoutId.value);
            unmountTimeoutId.value = null;
          }

          if (activeModuleTracking) {
            sharedStore.setIsActiveFederatedModule(moduleName, true);
          }

          if (!app.value && unref(modelValue)) {
            scheduleMount();
          }
        }
      },
    );
  }

  // --- Lifecycle ---

  onMounted(() => {
    isHostMounted.value = true;
    window.addEventListener(forceRemountEvent, remount);
    scheduleMount();
  });

  onUnmounted(() => {
    if (mountRetryTimeoutId.value) {
      clearTimeout(mountRetryTimeoutId.value);
      mountRetryTimeoutId.value = null;
    }

    unmount();
    window.removeEventListener(forceRemountEvent, remount);
  });

  return {
    app,
    moduleRouter,
    routerUnsubscribe,
    useIframe,
    iframeRef,
    isModuleRoute,
    isMounting,
    sharedStore,
    mount,
    unmount,
    remount,
    fallbackToIframe,
  };
}

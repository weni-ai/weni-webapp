import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';

import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useChatsModuleUpdateRoute } from '@/composables/useChatsModuleUpdateRoute';
import {
  normalizeInternalPath,
  parseInternalFromEventPath,
} from '@/utils/normalizeInternalPath';

/**
 * Chats-only federated module lifecycle (live desk + settings mounts).
 * Forked from useFederatedModule so legacy modules keep the pre-chats behavior.
 */
export function useChatsFederatedModule(config) {
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
    basePath = '',
    updateRoutePathPrefixes = [],
    defaultHomeRoute = null,
  } = config;

  const normalizedBasePath = basePath.replace(/^\/+|\/+$/gu, '');
  const hostRouteName = routeNameForUpdateRoute || moduleName;

  const injectedRoute = useRoute();
  const componentInstance = getCurrentInstance();
  const sharedStore = useSharedStore();

  // Composition API `useRoute()` can warn when the owning tree is not under a
  // matched route record (e.g. settings layout siblings). Fall back to the
  // Options API `$route` on the component instance so mount guards still work.
  const hostRoute = computed(() => {
    if (injectedRoute?.name) {
      return injectedRoute;
    }

    return componentInstance?.proxy?.$route ?? injectedRoute;
  });

  // --- Reactive State ---

  const app = ref(null);
  const moduleRouter = ref(null);
  const routerUnsubscribe = ref(null);
  const useIframe = ref(initialUseIframe);
  const iframeRef = ref(null);
  const isMounting = ref(false);
  const unmountTimeoutId = ref(null);
  const pendingHostSyncSkips = ref(0);
  const mountGeneration = ref(0);
  const themeEnforcementActive = ref(!!unref(modelValue));

  const syncPathPrefixes = [hostRouteName, ...updateRoutePathPrefixes];

  const isModuleRoute = computed(() =>
    routeNames.includes(hostRoute.value?.name),
  );

  function shouldSyncHostRoute() {
    return routeNames.includes(hostRoute.value?.name) || unref(modelValue);
  }

  function isMountStale(generation) {
    return generation !== mountGeneration.value;
  }

  function shouldKeepMounted(force) {
    // `modelValue` is the host's source of truth for whether this mount should
    // stay alive — do not also require `route.name` (redirect races and missing
    // route injection would discard a successful remote mount).
    return force || unref(modelValue);
  }

  function canMountFederated() {
    return !!(
      sharedStore.auth.token &&
      sharedStore.current.project.uuid &&
      !useIframe.value
    );
  }

  function scheduleMountWhenReady() {
    if (
      unref(modelValue) &&
      !app.value &&
      !isMounting.value &&
      canMountFederated()
    ) {
      mount();
    }
  }

  const { getInitialModuleRoute } = useChatsModuleUpdateRoute(hostRouteName, {
    basePath,
    eventPathPrefixes: updateRoutePathPrefixes,
    shouldSyncHostRoute,
    hostRoute,
  });

  // --- Core Functions ---

  /**
   * Build the path sent to the host via updateRoute, avoiding a duplicated module prefix
   * when the federated router already includes it.
   */
  function buildUpdateRoutePath(modulePath) {
    let subpath = modulePath.replace(/^\//, '');

    // Based instance (e.g. settings): strip the module-internal base so the
    // host route's `internal` reflects only the section path, and prefix with
    // the host route name so `handleUpdateRoute` targets the right route.
    if (normalizedBasePath) {
      if (subpath === normalizedBasePath) {
        subpath = '';
      } else if (subpath.startsWith(`${normalizedBasePath}/`)) {
        subpath = subpath.slice(normalizedBasePath.length + 1);
      }

      return subpath ? `${hostRouteName}/${subpath}` : hostRouteName;
    }

    // Live-desk instance: always prefix with the host route name so room paths
    // round-trip symmetrically (e.g. child `/chats/:roomId` → host
    // `chats/chats/:roomId` → child `/chats/:roomId`).
    return subpath ? `${hostRouteName}/${subpath}` : hostRouteName;
  }

  /**
   * @param {string} modulePath
   * @returns {string}
   */
  function getSyncedInternalPath(modulePath) {
    const eventPath = buildUpdateRoutePath(modulePath);
    return parseInternalFromEventPath(eventPath, syncPathPrefixes).join('/');
  }

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
      if (!unref(modelValue)) {
        return;
      }

      const syncedInternal = getSyncedInternalPath(to.path);
      const hostInternal = normalizeInternalPath(
        hostRoute.value?.params?.internal,
      );

      if (pendingHostSyncSkips.value > 0) {
        pendingHostSyncSkips.value -= 1;
        return;
      }

      if (syncedInternal && syncedInternal === hostInternal) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent('updateRoute', {
          detail: {
            path: buildUpdateRoutePath(to.path),
            query: to.query || {},
          },
        }),
      );
    });
  }

  function hostHasNoDeepLink() {
    const pathPart = normalizeInternalPath(hostRoute.value?.params?.internal);
    return !pathPart || pathPart === 'init';
  }

  /** Default landing when the host has no deep link (empty/`init` internal). */
  function getModuleHomeRoute() {
    if (!hostHasNoDeepLink()) {
      return null;
    }

    if (normalizedBasePath) {
      return { path: normalizedBasePath, query: hostRoute.value?.query || {} };
    }

    if (!defaultHomeRoute) {
      return null;
    }

    return { ...defaultHomeRoute, query: hostRoute.value?.query || {} };
  }

  function syncHostRouteToModuleRouter() {
    if (
      !app.value ||
      useIframe.value ||
      !moduleRouter.value ||
      isMounting.value ||
      !shouldSyncHostRoute()
    ) {
      return;
    }

    if (!isModuleRoute.value) {
      return;
    }

    const target = getInitialModuleRoute() ?? getModuleHomeRoute();

    if (!target) {
      return;
    }

    const router = moduleRouter.value;
    const currentFullPath = router.currentRoute?.value?.fullPath;

    let resolvedFullPath;

    try {
      resolvedFullPath = router.resolve(target)?.fullPath;
    } catch {
      resolvedFullPath = undefined;
    }

    if (resolvedFullPath && currentFullPath && resolvedFullPath === currentFullPath) {
      return;
    }

    // The resulting afterEach would echo back to the host as an updateRoute;
    // skip it since the module is only catching up to the host's location.
    pendingHostSyncSkips.value += 1;
    router.replace(target);
  }

  /** Host-owned `#containerId` must exist before the remote mounts into it. */
  async function waitForMountContainer(maxAttempts = 20) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (document.getElementById(containerId)) {
        return true;
      }
      await nextTick();
    }

    return false;
  }

  /**
   * Mount the federated module or initialize the iframe fallback.
   * Includes a concurrency guard (isMounting) to prevent overlapping mounts.
   *
   * @param {Object} [options]
   * @param {boolean} [options.force=false] - Mount even if modelValue is false
   */
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

    if (!force && !canMountFederated()) {
      return;
    }

    const generation = ++mountGeneration.value;
    isMounting.value = true;

    try {
      const containerReady = await waitForMountContainer();
      if (!containerReady) {
        if (!isMountStale(generation)) {
          await nextTick();
          scheduleMountWhenReady();
        }
        return;
      }

      if (isMountStale(generation)) {
        return;
      }

      const mountApp = await tryImportWithRetries(importFn, importPath);

      if (isMountStale(generation)) {
        return;
      }

      if (!mountApp) {
        if (iframeFallback) {
          fallbackToIframe();
        } else {
          console.error(`Failed to mount ${moduleName} app`);
        }
        return;
      }

      const initialRoute = getInitialModuleRoute();
      if (initialRoute?.path) {
        pendingHostSyncSkips.value += 1;
      }

      const { app: mountedApp, router: mountedRouter } = await mountApp({
        containerId,
        initialRoute,
        basePath,
        themeEnforcementActive,
      });

      if (isMountStale(generation) || !shouldKeepMounted(force)) {
        try {
          mountedApp.unmount();
        } catch {
          // DOM may already be detached by a concurrent host patch.
        }
        return;
      }

      app.value = mountedApp;
      moduleRouter.value = mountedRouter;

      if (activeModuleTracking && isModuleRoute.value) {
        sharedStore.setIsActiveFederatedModule(moduleName, true);
      }

      setupRouterSync();
      // Let the host finish patching (e.g. hide LoadingModule) before the
      // child router navigates — concurrent host/child DOM updates cause
      // `nextSibling` errors during unmount.
      await nextTick();
    } finally {
      isMounting.value = false;
    }

    // Run after isMounting clears — syncHostRouteToModuleRouter bails while
    // a mount is in flight, and this is the last step of a successful mount.
    syncHostRouteToModuleRouter();
  }

  /**
   * Switch to iframe fallback mode. Called automatically when module federation
   * import fails and iframeFallback is enabled.
   */
  function fallbackToIframe() {
    useIframe.value = true;
    nextTick(() => {
      iframeRef.value?.init(hostRoute.value?.params);
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
      try {
        app.value?.unmount();
      } catch {
        // Child DOM may already be detached by a host re-render.
      }
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
      await moduleRouter.value.replace({ name: 'home' });
    }
    unmount();
    await nextTick();
    mount({ force: true });
  }

  // --- Watchers ---

  // Auto-mount when modelValue becomes true (after initial render — the container
  // element is rendered by ChatsFederatedModule and is not in the DOM during setup).
  watch(
    () => unref(modelValue),
    (active) => {
      themeEnforcementActive.value = !!active;
      scheduleMountWhenReady();
    },
  );

  // Retry when auth/project prerequisites become available after a failed attempt
  // (e.g. mount ran before the host finished hydrating the shared store).
  watch(
    () => [
      sharedStore.auth.token,
      sharedStore.current.project.uuid,
    ],
    () => {
      scheduleMountWhenReady();
    },
  );

  // Reset or unmount on project change
  watch(
    () => sharedStore.current.project.uuid,
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

  // Host -> child navigation: when the module is already mounted, a host route
  // change (e.g. a redirect from another module, or switching the internal
  // section/room while staying on the same host route) is not picked up by the
  // child router, which uses an in-memory history seeded only at mount time.
  // Push the host's internal path into the module router so deep links keep
  // working without a remount.
  watch(
    () => [
      normalizeInternalPath(hostRoute.value?.params?.internal),
      hostRoute.value?.query,
    ],
    () => {
      if (!shouldSyncHostRoute()) {
        return;
      }

      syncHostRouteToModuleRouter();
    },
    { deep: true },
  );

  // Inactivity timeout and/or active module tracking on route transitions
  if (inactivityTimeout !== null || activeModuleTracking) {
    watch(
      () => hostRoute.value?.name,
      (newRoute, oldRoute) => {
        const wasModuleRoute = routeNames.includes(oldRoute);
        const isCurrentModuleRoute = routeNames.includes(newRoute);

        // Leaving the module route
        if (wasModuleRoute && !isCurrentModuleRoute) {
          if (!app.value) {
            mountGeneration.value += 1;
          }

          if (isMounting.value) {
            isMounting.value = false;
          }

          if (app.value && !useIframe.value) {
            if (activeModuleTracking) {
              sharedStore.setIsActiveFederatedModule(moduleName, false);
            }

            if (inactivityTimeout !== null) {
              unmountTimeoutId.value = setTimeout(() => {
                unmount();
              }, inactivityTimeout);
            }
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
            scheduleMountWhenReady();
          } else {
            nextTick(() => syncHostRouteToModuleRouter());
          }
        }
      },
    );
  }

  // --- Lifecycle ---

  onMounted(() => {
    window.addEventListener(forceRemountEvent, remount);

    scheduleMountWhenReady();
  });

  onUnmounted(() => {
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

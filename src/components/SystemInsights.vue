<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import ExternalSystem from './ExternalSystem.vue';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';

const insightsApp = ref(null);
const insightsRouter = ref(null);
const useIframe = ref(false);
const iframeInsights = ref(null);
const routerUnsubscribe = ref(null);
const unmountTimeout = ref(null);
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const isInsightsRoute = computed(() => ['insights'].includes(route.name));

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const sharedStore = useSharedStore();

const { getInitialModuleRoute } = useModuleUpdateRoute('insights');

function setupRouterSync() {
  if (routerUnsubscribe.value) {
    routerUnsubscribe.value();
  }

  if (!insightsRouter.value) {
    return;
  }

  routerUnsubscribe.value = insightsRouter.value.afterEach((to) => {
    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: `insights${to.path}`,
          query: to.query || {},
        },
      }),
    );
  });
}

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  const mountInsightsApp = await tryImportWithRetries(
    () => import('insights/main'),
    'insights/main',
  );

  if (!mountInsightsApp) {
    fallbackToIframe();
    return;
  }

  await nextTick();

  try {
    const initialRoute = getInitialModuleRoute();
    const { app, router } = await mountInsightsApp({
      containerId: 'insights-app',
      initialRoute,
    });

    insightsApp.value = app;
    insightsRouter.value = router;

    if (isInsightsRoute.value) {
      sharedStore.setIsActiveFederatedModule('insights', true);
    }

    setupRouterSync();
  } catch (err) {
    console.warn('[SystemInsights] Erro ao montar módulo federado:', err);
    fallbackToIframe();
  }
}

function fallbackToIframe() {
  useIframe.value = true;
  nextTick(() => {
    iframeInsights.value?.init(route.params);
  });
}

function unmount() {
  if (unmountTimeout.value) {
    clearTimeout(unmountTimeout.value);
    unmountTimeout.value = null;
  }

  sharedStore.setIsActiveFederatedModule('insights', false);

  if (routerUnsubscribe.value) {
    routerUnsubscribe.value();
    routerUnsubscribe.value = null;
  }

  insightsApp.value?.unmount();
  insightsApp.value = null;
  insightsRouter.value = null;
}

async function remount() {
  await insightsRouter.value.replace({ name: 'home' });
  unmount();
  await nextTick();
  mount({ force: true });
}

onMounted(() => {
  window.addEventListener('forceRemountInsights', remount);
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !insightsApp.value) {
      mount();
    }
  },
  { immediate: true },
);

// Hybrid approach: pause on leave, unmount after 5min of inactivity
watch(
  () => route.name,
  (newRoute, oldRoute) => {
    const wasInsightsRoute = oldRoute === 'insights';
    const isInsightsRoute = newRoute === 'insights';

    if (
      wasInsightsRoute &&
      !isInsightsRoute &&
      insightsApp.value &&
      !useIframe.value
    ) {
      sharedStore.setIsActiveFederatedModule('insights', false);

      unmountTimeout.value = setTimeout(() => {
        unmount();
      }, INACTIVITY_TIMEOUT);
    }

    if (!wasInsightsRoute && isInsightsRoute) {
      if (unmountTimeout.value) {
        clearTimeout(unmountTimeout.value);
        unmountTimeout.value = null;
      }

      sharedStore.setIsActiveFederatedModule('insights', true);

      if (!insightsApp.value && props.modelValue) {
        mount();
      }

      redirectForceToHumanServiceDashboard();
    }
  },
);

// This logic is temporary to work around the issue where the connect route is not reflected in the child module (insights).
// It affects some redirects that are made from other modules.
// Should be removed when this issue is addressed as this solution is not scalable.
function redirectForceToHumanServiceDashboard() {
  if (route.path.includes('insights/init/humanServiceDashboard')) {
    insightsRouter.value.push({
      name: 'humanServiceDashboard',
    });
  }
}

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeInsights.value?.reset() : unmount();
    }
  },
);

onUnmounted(() => {
  unmount();

  window.removeEventListener('forceRemountInsights', remount);
});
</script>

<template>
  <LoadingModule
    data-testid="insights-loading"
    :isModuleRoute="isInsightsRoute"
    :hasModuleApp="!!insightsApp"
    :useIframe="useIframe"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-if="!useIframe"
      v-show="insightsApp && isInsightsRoute"
      id="insights-app"
      class="system-insights__system"
      data-testid="insights-app"
    />
    <ExternalSystem
      v-else
      v-show="isInsightsRoute"
      ref="iframeInsights"
      data-testid="insights-iframe"
      :routes="['insights']"
      class="system-insights__iframe"
      dontUpdateWhenChangesLanguage
      name="insights"
    />
  </template>
</template>

<style scoped lang="scss">
.system-insights__system {
  height: 100%;
}

.system-insights__iframe {
  flex: 1;
  overflow: auto;
}
</style>

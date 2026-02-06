<script setup>
import { toRef, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import ExternalSystem from './ExternalSystem.vue';
import { useFederatedModule } from '@/composables/useFederatedModule';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

// mount, unmount, routerUnsubscribe are destructured for test access via wrapper.vm
const {
  app,
  moduleRouter,
  routerUnsubscribe, // eslint-disable-line no-unused-vars
  useIframe,
  iframeRef,
  isModuleRoute,
  sharedStore,
  mount, // eslint-disable-line no-unused-vars
  unmount, // eslint-disable-line no-unused-vars
} = useFederatedModule({
  moduleName: 'insights',
  importFn: () => import('insights/main'),
  importPath: 'insights/main',
  containerId: 'insights-app',
  routeNames: ['insights'],
  forceRemountEvent: 'forceRemountInsights',
  modelValue: toRef(props, 'modelValue'),
  iframeFallback: true,
  inactivityTimeout: 5 * 60 * 1000, // 5 minutes
  activeModuleTracking: true,
});

// This logic is temporary to work around the issue where the connect route is not reflected in the child module (insights).
// It affects some redirects that are made from other modules.
// Should be removed when this issue is addressed as this solution is not scalable.
function redirectForceToHumanServiceDashboard() {
  if (route.path.includes('insights/init/humanServiceDashboard')) {
    moduleRouter.value.push({
      name: 'humanServiceDashboard',
    });
  }
}

watch(
  () => route.name,
  (newRoute, oldRoute) => {
    const wasInsightsRoute = oldRoute === 'insights';
    if (!wasInsightsRoute && newRoute === 'insights') {
      redirectForceToHumanServiceDashboard();
    }
  },
);
</script>

<template>
  <LoadingModule
    data-testid="insights-loading"
    :isModuleRoute="isModuleRoute"
    :hasModuleApp="!!app"
    :useIframe="useIframe"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-if="!useIframe"
      v-show="app && isModuleRoute"
      id="insights-app"
      class="system-insights__system"
      data-testid="insights-app"
    />
    <ExternalSystem
      v-else
      v-show="isModuleRoute"
      ref="iframeRef"
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

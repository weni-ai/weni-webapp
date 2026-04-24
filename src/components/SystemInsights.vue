<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import FederatedModule from './modules/FederatedModule.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

const federatedModuleRef = ref(null);

// This logic is temporary to work around the issue where the connect route is not reflected in the child module (insights).
// It affects some redirects that are made from other modules.
// Should be removed when this issue is addressed as this solution is not scalable.
function redirectForceToHumanServiceDashboard() {
  if (route.path.includes('insights/init/humanServiceDashboard')) {
    federatedModuleRef.value?.moduleRouter?.push({
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
  <FederatedModule
    ref="federatedModuleRef"
    moduleName="insights"
    :importFn="() => import('insights/main')"
    importPath="insights/main"
    containerId="insights-app"
    :routeNames="['insights']"
    forceRemountEvent="forceRemountInsights"
    :modelValue="modelValue"
    :iframeFallback="true"
    :inactivityTimeout="5 * 60 * 1000"
    :activeModuleTracking="true"
    :iframeRoutes="['insights']"
    iframeName="insights"
    iframeDontUpdateWhenChangesLanguage
    systemClass="system-insights__system"
    iframeClass="system-insights__iframe"
  />
</template>

<style lang="scss">
.system-insights__system {
  height: 100%;
}

.system-insights__iframe {
  flex: 1;
  overflow: auto;
}
</style>

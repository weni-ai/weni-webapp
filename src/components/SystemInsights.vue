<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

import ExternalSystem from './ExternalSystem.vue';

const insightsApp = ref(null);
const useIframe = ref(false);

onMounted(async () => {
  try {
    const { mountInsightsApp } = await import('insights/insights-app');
    insightsApp.value = await mountInsightsApp('insights-app');
  } catch (error) {
    console.log(error);
    useIframe.value = true;
  }
});
onUnmounted(() => {
  insightsApp.value?.unmount();
  insightsApp.value = null;
});
</script>

<template>
  <template v-if="$keycloak.token && $store.getters.currentProject?.uuid">
    <section
      v-if="!useIframe"
      v-show="['insights'].includes($route.name)"
      id="insights-app"
    />
    <ExternalSystem
      v-else
      ref="system-insights"
      :routes="['insights']"
      class="page"
      dontUpdateWhenChangesLanguage
      name="insights"
    />
  </template>
</template>

<style scoped lang="scss">
#insights-app {
  height: 100%;
}
</style>

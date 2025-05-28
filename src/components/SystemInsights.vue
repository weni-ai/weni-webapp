<script setup>
import { onMounted, ref } from 'vue';
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
</script>

<template>
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

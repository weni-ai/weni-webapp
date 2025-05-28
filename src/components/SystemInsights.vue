<script setup>
import { onMounted, ref, watch } from 'vue';
import { useSharedStore } from '../store/Shared';
import ExternalSystem from './ExternalSystem.vue';

const sharedStore = useSharedStore();

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

watch(
  () => sharedStore.current.project.uuid,
  async () => {
    console.log('project.uuid changed');
    await insightsApp.value.unmount();
    const { mountInsightsApp } = await import('insights/insights-app');
    insightsApp.value = await mountInsightsApp('insights-app');
  },
);
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

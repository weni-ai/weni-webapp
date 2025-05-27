<script setup>
import { safeAsyncComponent } from '@/utils/moduleFederation';
import { onMounted, ref } from 'vue';

const RemoteDiscoveryCommerce = safeAsyncComponent(
  () => import('commerce/solution-card'),
);
const RemoteDashboardInsights = safeAsyncComponent(
  () => import('insights/dashboard-commerce'),
);

const insightsApp = ref(null);

onMounted(async () => {
  const { mountInsightsApp } = await import('insights/insights-app');
  insightsApp.value = await mountInsightsApp('insights-app');
});

const props = defineProps({
  auth: {
    type: Object || null,
    default: null,
  },
});
</script>

<template>
  <section id="insights-app"></section>
  <!-- <RemoteDashboardInsights v-if="props.auth.token && props.auth.uuid" />
  <RemoteDiscoveryCommerce
    v-if="props.auth.token && props.auth.uuid"
    type="remote"
  /> -->
</template>

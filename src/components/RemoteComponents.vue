<script setup>
import { defineAsyncComponent } from 'vue';

const RemoteDiscoveryCommerce = defineAsyncComponent(
  () => import('commerce/solution-card'),
);
const RemoteDashboardInsights = defineAsyncComponent(
  () => import('insights/dashboard-commerce'),
);

const props = defineProps({
  auth: {
    type: Object || null,
    default: null,
  },
});
</script>

<template>
  <RemoteDashboardInsights
    v-if="!!RemoteDashboardInsights && props.auth.token && props.auth.uuid"
  />
  <RemoteDiscoveryCommerce
    v-if="!!RemoteDiscoveryCommerce && props.auth.token && props.auth.uuid"
    type="remote"
  />
</template>

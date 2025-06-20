<script setup>
import { safeAsyncComponent } from '@/utils/moduleFederation';

const RemoteDiscoveryCommerce = safeAsyncComponent(
  () => import('commerce/solution-card'),
);
const RemoteDashboardInsights = safeAsyncComponent(
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
  <RemoteDashboardInsights v-if="props.auth.token && props.auth.uuid" />
  <RemoteDiscoveryCommerce
    v-if="props.auth.token && props.auth.uuid"
    type="remote"
  />
</template>

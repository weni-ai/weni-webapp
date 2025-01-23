<script setup>
import { defineAsyncComponent } from 'vue';

const RemoteDiscoveryCommerce = defineAsyncComponent(() => import('remote/solution-card'));
const RemoteDashboardInsights = defineAsyncComponent(() => import('remote_insights/dashboard-commerce'));
  
const props = defineProps({
  auth: {
    type: Object || null,
    default: null,
  },
});
</script>

<template>
<RemoteDashboardInsights v-if="!!RemoteDashboardInsights" />
<RemoteDiscoveryCommerce
    v-if="!!RemoteDiscoveryCommerce && props.auth.token && props.auth.uuid"
    type="remote"
    :auth="{
      token: `Bearer ${props.auth.token}`,
      uuid: props.auth.uuid,
    }"
/>
</template>

<style scoped></style>

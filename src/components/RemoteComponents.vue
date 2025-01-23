<script setup>
import { defineAsyncComponent } from 'vue';

/*const RemoteDiscoveryCommerce = defineAsyncComponent(() => import('remote/solution-card'));
<RemoteDiscoveryCommerce
    v-if="!!RemoteDiscoveryCommerce && props.auth.token && props.auth.uuid"
    type="remote"
    :auth="{
      token: `Bearer ${props.auth.token}`,
      uuid: props.auth.uuid,
    }"
/>*/
const RemoteDashboardInsights = defineAsyncComponent(() => import('remote/dashboard-commerce'));
  
const props = defineProps({
  auth: {
    type: Object || null,
    default: null,
  },
});
</script>

<template>
  <RemoteDashboardInsights v-if="!!RemoteDashboardInsights" />
</template>

<style scoped></style>

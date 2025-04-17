<script setup>
import { defineAsyncComponent } from 'vue';

const RemoteDiscoveryCommerce = defineAsyncComponent(
  () => import('remote/solution-card'),
);
const RemoteDashboardInsights = defineAsyncComponent(
  () => import('remote_insights/dashboard-commerce'),
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
    :auth="{
      token: props.auth.token,
      uuid: props.auth.uuid,
    }"
  />
  <RemoteDiscoveryCommerce
    v-if="!!RemoteDiscoveryCommerce && props.auth.token && props.auth.uuid"
    type="remote"
  />
</template>

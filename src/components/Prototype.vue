<script setup>
import { defineAsyncComponent } from 'vue';

const RemoteMFE = defineAsyncComponent(() => import('remote/solution-card'));

const props = defineProps({
  auth: {
    type: Object || null,
    default: null,
  },
});

</script>

<template>
  <RemoteMFE 
    v-if="!!RemoteMFE && props.auth.token && props.auth.uuid"        
    type="remote"
    :auth="{
      token: `Bearer ${props.auth.token}`,
      uuid: props.auth.uuid,
    }"
  />
</template>

<style scoped>
</style>

<script setup>
import FederatedModule from './modules/FederatedModule.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <FederatedModule
    moduleName="settingsChannels"
    :importFn="() => import('integrations/main')"
    importPath="integrations/main"
    containerId="integrations-app"
    :routeNames="['settingsChannels']"
    :updateRoutePathPrefixes="['integrations']"
    forceRemountEvent="forceRemountIntegrations"
    :modelValue="modelValue"
    systemClass="system-integrations__system"
  />
</template>

<style lang="scss">
.system-integrations__system {
  overflow: auto;
}
</style>

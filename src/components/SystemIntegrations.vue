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
  <div class="page system-integrations">
    <FederatedModule
      moduleName="settingsChannels"
      :importFn="() => import('integrations/main')"
      importPath="integrations/main"
      containerId="integrations-app"
      :routeNames="['settingsChannels']"
      forceRemountEvent="forceRemountIntegrations"
      :modelValue="modelValue"
      :iframeFallback="false"
      :remountRoute="{ path: '/init' }"
      systemClass="system-integrations__system"
    />
  </div>
</template>

<style lang="scss">
.system-integrations {
  height: 100%;
  width: 100%;
}

.system-integrations__system {
  height: 100%;
  width: 100%;
}
</style>

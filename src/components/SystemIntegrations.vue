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
    forceRemountEvent="forceRemountIntegrations"
    :modelValue="modelValue"
    :iframeFallback="true"
    :iframeRoutes="['settingsChannels']"
    iframeName="integrations"
    iframeDontUpdateWhenChangesLanguage
    systemClass="system-integrations__system"
    iframeClass="system-integrations__iframe"
  />
</template>

<style lang="scss">
.system-integrations__system {
  height: 100%;
  width: 100%;
}

.system-integrations__iframe {
  flex: 1;
  overflow: auto;
}
</style>

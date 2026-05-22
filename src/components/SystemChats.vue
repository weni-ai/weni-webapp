<script setup>
import FederatedModule from './modules/FederatedModule.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  routeNames: {
    type: Array,
    required: true,
  },
  iframeName: {
    type: String,
    required: true,
  },
  containerId: {
    type: String,
    required: true,
  },
  forceRemountEvent: {
    type: String,
    default: 'forceRemountChats',
  },
});
</script>

<template>
  <FederatedModule
    moduleName="chats"
    :importFn="() => import('chats/main')"
    importPath="chats/main"
    :containerId="containerId"
    :routeNames="routeNames"
    :forceRemountEvent="forceRemountEvent"
    :modelValue="modelValue"
    :iframeFallback="true"
    :inactivityTimeout="5 * 60 * 1000"
    :activeModuleTracking="true"
    :iframeRoutes="routeNames"
    :iframeName="iframeName"
    iframeDontUpdateWhenChangesLanguage
    systemClass="system-chats__system"
    iframeClass="system-chats__iframe"
  />
</template>

<style lang="scss">
.system-chats__system {
  height: 100%;
}

.system-chats__iframe {
  flex: 1;
  overflow: auto;
}
</style>

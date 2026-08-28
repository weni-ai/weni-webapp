<script setup>
import ChatsFederatedModule from './modules/ChatsFederatedModule.vue';

const CHATS_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  routeNames: {
    type: Array,
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
  routeNameForUpdateRoute: {
    type: String,
    default: '',
  },
  basePath: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <ChatsFederatedModule
    moduleName="chats"
    :importFn="() => import('chats/main')"
    importPath="chats/main"
    :containerId="containerId"
    :routeNames="routeNames"
    :forceRemountEvent="forceRemountEvent"
    :modelValue="modelValue"
    :inactivityTimeout="CHATS_INACTIVITY_TIMEOUT_MS"
    :activeModuleTracking="true"
    :routeNameForUpdateRoute="routeNameForUpdateRoute"
    :basePath="basePath"
    :defaultHomeRoute="{ path: '/rooms' }"
    systemClass="system-chats__system"
  />
</template>

<style lang="scss">
.system-chats__system {
  height: 100%;
}
</style>

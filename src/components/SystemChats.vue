<script setup>
import ChatsFederatedModule from './modules/ChatsFederatedModule.vue';

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
  // Live desk keeps a short keep-alive so insights↔chats stays fast.
  // Settings must stay `null` so the remote unmounts immediately when leaving
  // settingsChats for another settings tab (channels, workspace, …) — otherwise
  // a zombie chats instance keeps fighting the host over `documentElement.dark`.
  inactivityTimeout: {
    type: Number,
    default: null,
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
    :inactivityTimeout="inactivityTimeout"
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

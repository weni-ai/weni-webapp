<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import FederatedModule from './modules/FederatedModule.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

const federatedModuleRef = ref(null);

const moduleSegments = [
  { hostName: 'aiAgents', pathPrefix: '/agents' },
  { hostName: 'aiBuild', pathPrefix: '/knowledge' },
  { hostName: 'aiConversations', pathPrefix: '/conversations' },
];

const defaultSegment = moduleSegments[0];

const hostNameToInitialPath = {
  agentBuilder: '/agents',
  aiAgents: '/agents',
  aiBuild: '/knowledge',
  aiConversations: '/conversations',
};

function getInitialModuleRoute() {
  return {
    path: hostNameToInitialPath[route.name] || '/agents',
    query: route.query || {},
  };
}

function getHostRouteFromModulePath(to) {
  const segment =
    moduleSegments.find(({ pathPrefix }) => to.path.startsWith(pathPrefix)) ||
    defaultSegment;

  const internal = to.path.slice(segment.pathPrefix.length).replace(/^\//, '');

  return {
    name: segment.hostName,
    path: `${segment.hostName}/${internal || 'init'}`,
  };
}

watch(
  () => route.name,
  (newRouteName) => {
    const targetPath = hostNameToInitialPath[newRouteName];
    const router = federatedModuleRef.value?.moduleRouter;

    if (!targetPath || !router) {
      return;
    }

    if (router.currentRoute?.value?.path !== targetPath) {
      router.push(targetPath);
    }
  },
);
</script>

<template>
  <FederatedModule
    ref="federatedModuleRef"
    moduleName="agentBuilder"
    :importFn="() => import('agent_builder/main')"
    importPath="agent_builder/main"
    containerId="agent-builder-app"
    :routeNames="['agentBuilder', 'aiBuild', 'aiAgents', 'aiConversations']"
    :hostRouteNames="['agentBuilder', 'aiBuild', 'aiAgents', 'aiConversations']"
    forceRemountEvent="forceRemountAgentBuilder"
    :modelValue="modelValue"
    :activeModuleTracking="true"
    :getInitialModuleRoute="getInitialModuleRoute"
    :getHostRouteFromModulePath="getHostRouteFromModulePath"
    systemClass="system-agent-builder__system"
  />
</template>

<style lang="scss">
.system-agent-builder__system {
  height: 100%;
}
</style>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import FederatedModule from './modules/FederatedModule.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();

const agentBuilderRoutes = [
  'agentBuilder',
  'aiBuild',
  'aiAgents',
  'aiConversations',
];

const hostToModuleRouteMap = {
  aiBuild: 'build',
  aiAgents: 'agents',
  aiConversations: 'conversations',
};

const moduleToHostRouteMap = {
  conversations: 'aiConversations',
  agents: 'aiAgents',
  build: 'aiBuild',
};

const federatedModuleRef = ref(null);

function resolveInitialRoute() {
  const moduleRouteName = hostToModuleRouteMap[route.name];
  return moduleRouteName ? { name: moduleRouteName } : undefined;
}

function handleRouteUpdate(event) {
  const path = event.detail?.path;
  if (!path || !path.startsWith('agentBuilder')) return;

  const segments = path.split('/').slice(1).filter(Boolean);
  if (!segments.length) return;

  const firstSegment = segments[0];
  const hostRouteName = moduleToHostRouteMap[firstSegment];

  if (!hostRouteName) return;

  event.stopImmediatePropagation();

  router.replace({
    name: hostRouteName,
    params: { internal: segments },
    query: event.detail.query || {},
  });
}

window.addEventListener('updateRoute', handleRouteUpdate);

onUnmounted(() => {
  window.removeEventListener('updateRoute', handleRouteUpdate);
});

watch(
  () => route.name,
  (newRoute, oldRoute) => {
    if (newRoute === oldRoute) return;

    const wasAgentBuilderRoute = agentBuilderRoutes.includes(oldRoute);
    const isAgentBuilderRoute = agentBuilderRoutes.includes(newRoute);

    if (isAgentBuilderRoute && wasAgentBuilderRoute) {
      const moduleRouteName = hostToModuleRouteMap[newRoute];
      if (moduleRouteName) {
        const currentModuleRouteName =
          federatedModuleRef.value?.moduleRouter?.currentRoute?.value?.name;
        if (currentModuleRouteName !== moduleRouteName) {
          federatedModuleRef.value?.moduleRouter?.push({
            name: moduleRouteName,
          });
        }
      }
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
    :routeNames="agentBuilderRoutes"
    forceRemountEvent="forceRemountAgentBuilder"
    :modelValue="modelValue"
    :initialRouteResolver="resolveInitialRoute"
    systemClass="system-agent-builder__system"
  />
</template>

<style lang="scss">
.system-agent-builder__system {
  height: 100%;
}
</style>

<script setup>
import { onMounted, toRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import getEnv from '@/utils/env';
import ExternalSystem from './ExternalSystem.vue';
import { useFederatedModule } from '@/composables/useFederatedModule';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();

const { iframeRef, isModuleRoute, sharedStore, remount } = useFederatedModule({
  moduleName: 'agentBuilder',
  importFn: () => import('agent_builder/main'),
  importPath: 'agent_builder/main',
  containerId: 'agent-builder-app',
  routeNames: ['agentBuilder', 'aiBuild', 'aiAgents', 'aiConversations'],
  forceRemountEvent: 'forceRemountAgentBuilder',
  modelValue: toRef(props, 'modelValue'),
  iframeFallback: false,
  initialUseIframe: true,
  routeNameForUpdateRoute: route.name,
});

// AgentBuilder-specific: handle iframe route redirects from external messages
function updateIframeRoute(path) {
  if (!path.includes('agents-builder')) {
    return;
  }

  const [_, next] = (path || '').split(':');

  const agentBuilderUrl = getEnv('MODULES_YAML').agent_builder;

  iframeRef.value.setSrc(`${agentBuilderUrl}${next === 'init' ? '' : next}`);

  router.push({
    name: 'agentBuilder',
    params: {
      internal: next.split('/'),
    },
  });
}

onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.data?.event === 'redirect') {
      updateIframeRoute(event.data?.path);
    }
  });
});

// AgentBuilder-specific: remount when navigating between sub-routes
watch(
  () => route.name,
  () => {
    if (['aiBuild', 'aiAgents', 'aiConversations'].includes(route.name)) {
      remount();
    }
  },
);
</script>

<template>
  <ExternalSystem
    v-if="sharedStore.auth.token && sharedStore.current.project.uuid"
    v-show="isModuleRoute"
    ref="iframeRef"
    data-testid="agent-builder-iframe"
    :routes="['agentBuilder', 'aiBuild', 'aiAgents', 'aiConversations']"
    class="system-agent-builder__iframe"
    dontUpdateWhenChangesLanguage
    name="agent-builder"
  />
</template>

<style scoped lang="scss">
.system-agent-builder__iframe {
  height: 100%;
}
</style>

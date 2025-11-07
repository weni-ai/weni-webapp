<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import getEnv from '@/utils/env';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import ExternalSystem from './ExternalSystem.vue';

const aiAgentsApp = ref(null);
const aiAgentsRouter = ref(null);
const useIframe = ref(true);
const iframeAiAgents = ref(null);

const isAiAgentsRoute = computed(() => ['aiAgents'].includes(route.name));

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();
const sharedStore = useSharedStore();

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  if (useIframe.value) {
    await nextTick();

    if (iframeAiAgents.value) {
      iframeAiAgents.value.init();
    } else {
      console.warn('iframeAiAgents ref is not available');
    }
    return;
  }

  const mountAiAgentsApp = await tryImportWithRetries(
    () => import('agent_builder/main'),
    'agent_builder/main',
  );

  if (!mountAiAgentsApp) {
    console.error('Failed to mount ai build app');
    return;
  }

  const { getInitialModuleRoute } = useModuleUpdateRoute('aiAgents');
  const initialRoute = getInitialModuleRoute();

  const { app, router } = await mountAiAgentsApp({
    containerId: 'ai-agents-app',
    initialRoute,
  });

  aiAgentsApp.value = app;
  aiAgentsRouter.value = router;
}

function unmount() {
  aiAgentsApp.value?.unmount();
  aiAgentsApp.value = null;
}

async function remount() {
  await aiAgentsRouter.value.replace({ name: 'home' });
  unmount();
  await nextTick();
  mount({ force: true });
}

function updateIframeRoute(path) {
  // TODO: check how this will work
  if (!path.includes('agents-builder')) {
    return;
  }

  const [_, next] = (path || '').split(':');

  const agentBuilderUrl = getEnv('MODULES_YAML').agent_builder;

  iframeAiAgents.value.setSrc(
    `${agentBuilderUrl}${next === 'init' ? '' : next}`,
  );

  router.push({
    name: 'aiAgents',
    params: {
      internal: next.split('/'),
    },
  });
}

onMounted(() => {
  window.addEventListener('forceRemountAiAgents', remount);
  window.addEventListener('message', (event) => {
    if (event.data?.event === 'redirect') {
      updateIframeRoute(event.data?.path);
    }
  });
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !aiAgentsApp.value) {
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeAiAgents.value?.reset() : unmount();
    }
  },
);

onUnmounted(() => {
  unmount();

  window.removeEventListener('forceRemountAgentBuilder', remount);
});
</script>

<template>
  <ExternalSystem
    v-if="sharedStore.auth.token && sharedStore.current.project.uuid"
    v-show="isAiAgentsRoute"
    ref="iframeAiAgents"
    data-testid="ai-agents-iframe"
    :routes="['aiAgents']"
    class="system-ai-agents__iframe"
    dontUpdateWhenChangesLanguage
    name="aiAgents"
  />
</template>

<style scoped lang="scss">
.system-ai-agents__iframe {
  height: 100%;
}
</style>

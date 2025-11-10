<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import getEnv from '@/utils/env';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import ExternalSystem from './ExternalSystem.vue';

const agentBuilderApp = ref(null);
const agentBuilderRouter = ref(null);
const useIframe = ref(true);
const iframeAgentBuilder = ref(null);

const isAgentBuilderRoute = computed(() =>
  ['agentBuilder', 'aiBuild', 'aiAgents', 'aiConversations'].includes(
    route.name,
  ),
);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();
const sharedStore = useSharedStore();

const { getInitialModuleRoute } = useModuleUpdateRoute(route.name);

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  if (useIframe.value) {
    await nextTick();

    if (iframeAgentBuilder.value) {
      iframeAgentBuilder.value.init();
    } else {
      console.warn('iframeAgentBuilder ref is not available');
    }
    return;
  }

  const mountAgentBuilderApp = await tryImportWithRetries(
    () => import('agent_builder/main'),
    'agent_builder/main',
  );

  if (!mountAgentBuilderApp) {
    console.error('Failed to mount agent builder app');
    return;
  }

  const initialRoute = getInitialModuleRoute();

  const { app, router } = await mountAgentBuilderApp({
    containerId: 'agent-builder-app',
    initialRoute,
  });

  agentBuilderApp.value = app;
  agentBuilderRouter.value = router;
}

function unmount() {
  if (useIframe.value) {
    iframeAgentBuilder.value?.reset();
  } else {
    agentBuilderApp.value?.unmount();
    agentBuilderApp.value = null;
  }
}

async function remount() {
  if (agentBuilderRouter.value) {
    await agentBuilderRouter.value.replace({ name: 'home' });
  }
  unmount();
  await nextTick();
  mount({ force: true });
}

function updateIframeRoute(path) {
  if (!path.includes('agents-builder')) {
    return;
  }

  const [_, next] = (path || '').split(':');

  const agentBuilderUrl = getEnv('MODULES_YAML').agent_builder;

  iframeAgentBuilder.value.setSrc(
    `${agentBuilderUrl}${next === 'init' ? '' : next}`,
  );

  router.push({
    name: 'agentBuilder',
    params: {
      internal: next.split('/'),
    },
  });
}

onMounted(() => {
  window.addEventListener('forceRemountAgentBuilder', remount);
  window.addEventListener('message', (event) => {
    if (event.data?.event === 'redirect') {
      updateIframeRoute(event.data?.path);
    }
  });
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !agentBuilderApp.value) {
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeAgentBuilder.value?.reset() : unmount();
    }
  },
);

watch(
  () => route.name,
  () => {
    if (
      ['agentBuilder', 'aiBuild', 'aiAgents', 'aiConversations'].includes(
        route.name,
      )
    ) {
      remount();
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
    v-show="isAgentBuilderRoute"
    ref="iframeAgentBuilder"
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

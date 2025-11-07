<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import getEnv from '@/utils/env';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import ExternalSystem from './ExternalSystem.vue';

const aiConversationsApp = ref(null);
const aiConversationsRouter = ref(null);
const useIframe = ref(true);
const iframeAiConversations = ref(null);

const isAiConversationsRoute = computed(() =>
  ['aiConversations'].includes(route.name),
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

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  if (useIframe.value) {
    await nextTick();

    if (iframeAiConversations.value) {
      iframeAiConversations.value.init();
    } else {
      console.warn('iframeAiConversations ref is not available');
    }
    return;
  }

  const mountAiConversationsApp = await tryImportWithRetries(
    () => import('agent_builder/main'),
    'agent_builder/main',
  );

  if (!mountAiConversationsApp) {
    console.error('Failed to mount ai build app');
    return;
  }

  const { getInitialModuleRoute } = useModuleUpdateRoute('aiConversations');
  const initialRoute = getInitialModuleRoute();

  const { app, router } = await mountAiConversationsApp({
    containerId: 'ai-conversations-app',
    initialRoute,
  });

  aiConversationsApp.value = app;
  aiConversationsRouter.value = router;
}

function unmount() {
  aiConversationsApp.value?.unmount();
  aiConversationsApp.value = null;
}

async function remount() {
  await aiConversationsRouter.value.replace({ name: 'home' });
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

  iframeAiConversations.value.setSrc(
    `${agentBuilderUrl}${next === 'init' ? '' : next}`,
  );

  router.push({
    name: 'aiConversations',
    params: {
      internal: next.split('/'),
    },
  });
}

onMounted(() => {
  window.addEventListener('forceRemountAiConversations', remount);
  window.addEventListener('message', (event) => {
    if (event.data?.event === 'redirect') {
      updateIframeRoute(event.data?.path);
    }
  });
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !aiConversationsApp.value) {
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeAiConversations.value?.reset() : unmount();
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
    v-show="isAiConversationsRoute"
    ref="iframeAiConversations"
    data-testid="ai-conversations-iframe"
    :routes="['aiConversations']"
    class="system-ai-conversations__iframe"
    dontUpdateWhenChangesLanguage
    name="aiConversations"
  />
</template>

<style scoped lang="scss">
.system-ai-conversations__iframe {
  height: 100%;
}
</style>

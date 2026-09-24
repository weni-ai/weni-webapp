<script setup>
import { computed, onMounted, onUnmounted, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import getEnv from '@/utils/env';
import ExternalSystem from './ExternalSystem.vue';
import { useFederatedModule } from '@/composables/useFederatedModule';
import { waitFor } from '@/utils/waitFor';

const CONVERSATION_STARTER_PATHS = [
  'ai-conversations/conversations/improvements',
];

// The webchat widget discards conversation starters shortly after any SPA
// navigation, so they have to be applied again once that delay has passed.
const WEBCHAT_STARTERS_DELAY_MS = 400;

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const { t, locale } = useI18n();
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

const shouldShowConversationStarters = computed(() =>
  CONVERSATION_STARTER_PATHS.some((path) => route.path.endsWith(path)),
);

let webChatStartersTimeout = null;

function scheduleWebChatConversationStarters() {
  clearTimeout(webChatStartersTimeout);

  webChatStartersTimeout = setTimeout(() => {
    setWebChatConversationStarters();
  }, WEBCHAT_STARTERS_DELAY_MS);
}

function setWebChatConversationStarters() {
  // Leaving the page is always a navigation, which makes the widget drop
  // the starters on its own, so there is nothing to clear.
  if (!shouldShowConversationStarters.value) {
    return;
  }

  waitFor(() => window.WebChat).then((WebChat) => {
    if (shouldShowConversationStarters.value) {
      WebChat.setConversationStarters([
        t('agent_builder.conversation_starters.ask_a_question'),
        t('agent_builder.conversation_starters.share_feedback'),
      ]);
    }
  });
}

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

onUnmounted(() => {
  clearTimeout(webChatStartersTimeout);
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

watch(
  () => [shouldShowConversationStarters.value, route.fullPath, locale.value],
  scheduleWebChatConversationStarters,
  { immediate: true },
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

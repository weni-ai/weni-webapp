<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import getEnv from '@/utils/env';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import ExternalSystem from './ExternalSystem.vue';

const aiBuildApp = ref(null);
const aiBuildRouter = ref(null);
const useIframe = ref(true);
const iframeAiBuild = ref(null);

const isAiBuildRoute = computed(() => ['aiBuild'].includes(route.name));

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

    if (iframeAiBuild.value) {
      iframeAiBuild.value.init();
    } else {
      console.warn('iframeAiBuild ref is not available');
    }
    return;
  }

  const mountAiBuildApp = await tryImportWithRetries(
    () => import('agent_builder/main'),
    'agent_builder/main',
  );

  if (!mountAiBuildApp) {
    console.error('Failed to mount ai build app');
    return;
  }

  const { getInitialModuleRoute } = useModuleUpdateRoute('aiBuild');
  const initialRoute = getInitialModuleRoute();

  const { app, router } = await mountAiBuildApp({
    containerId: 'ai-build-app',
    initialRoute,
  });

  aiBuildApp.value = app;
  aiBuildRouter.value = router;
}

function unmount() {
  aiBuildApp.value?.unmount();
  aiBuildApp.value = null;
}

async function remount() {
  await aiBuildRouter.value.replace({ name: 'home' });
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

  iframeAiBuild.value.setSrc(
    `${agentBuilderUrl}${next === 'init' ? '' : next}`,
  );

  router.push({
    name: 'aiBuild',
    params: {
      internal: next.split('/'),
    },
  });
}

onMounted(() => {
  window.addEventListener('forceRemountAiBuild', remount);
  window.addEventListener('message', (event) => {
    if (event.data?.event === 'redirect') {
      updateIframeRoute(event.data?.path);
    }
  });
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !aiBuildApp.value) {
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeAiBuild.value?.reset() : unmount();
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
    v-show="isAiBuildRoute"
    ref="iframeAiBuild"
    data-testid="ai-build-iframe"
    :routes="['aiBuild']"
    class="system-ai-build__iframe"
    dontUpdateWhenChangesLanguage
    name="aiBuild"
  />
</template>

<style scoped lang="scss">
.system-ai-build__iframe {
  height: 100%;
}
</style>

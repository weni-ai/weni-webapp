<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';

const agentBuilderApp = ref(null);
const agentBuilderRouter = ref(null);

const isAgentBuilderRoute = computed(() =>
  ['agentBuilder'].includes(route.name),
);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const sharedStore = useSharedStore();

const { getInitialModuleRoute } = useModuleUpdateRoute('agentBuilder');

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
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
  agentBuilderApp.value?.unmount();
  agentBuilderApp.value = null;
}

async function remount() {
  await agentBuilderRouter.value.replace({ name: 'home' });
  unmount();
  await nextTick();
  mount({ force: true });
}

onMounted(() => {
  window.addEventListener('forceRemountAgentBuilder', remount);
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
      unmount();
    }
  },
);

onUnmounted(() => {
  unmount();

  window.removeEventListener('forceRemountAgentBuilder', remount);
});
</script>

<template>
  <LoadingModule
    data-testid="agent-builder-loading"
    :isModuleRoute="isAgentBuilderRoute"
    :hasModuleApp="!!agentBuilderApp"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-show="agentBuilderApp && isAgentBuilderRoute"
      id="agent-builder-app"
      class="system-agent-builder__system"
      data-testid="agent-builder-app"
    />
  </template>
</template>

<style scoped lang="scss">
.system-agent-builder__system {
  height: 100%;
}
</style>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { tryImportWithRetries } from '../utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import ExternalSystem from './ExternalSystem.vue';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import LoadingModule from '@/components/modules/LoadingModule.vue';

const integrationsApp = ref(null);
const integrationsRouter = ref(null);
const useIframe = ref(false);
const iframeIntegrations = ref(null);

const isIntegrationsRoute = computed(() =>
  ['integrations'].includes(route.name),
);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const sharedStore = useSharedStore();

const { getInitialModuleRoute } = useModuleUpdateRoute('integrations');

async function mount({ force = false } = {}) {
  console.log('[integrations] mount', force, props.modelValue);
  if (!force && !props.modelValue) return;

  const mountIntegrationsApp = await tryImportWithRetries(
    () => import('integrations/main'),
    'integrations/main',
  );

  if (!mountIntegrationsApp) {
    fallbackToIframe();
    return;
  }

  const initialRoute = getInitialModuleRoute();

  const { app, router } = await mountIntegrationsApp({
    containerId: 'integrations-app',
    initialRoute,
  });

  integrationsApp.value = app;
  integrationsRouter.value = router;
}

function fallbackToIframe() {
  console.log('[integrations] fallbackToIframe');
  useIframe.value = true;
  nextTick(() => {
    iframeIntegrations.value?.init(route.params);
  });
}

function unmount() {
  integrationsApp.value?.unmount();
  integrationsApp.value = null;
}

async function remount() {
  await integrationsRouter.value.replace({ name: 'Discovery' });
  unmount();
  await nextTick();
  mount({ force: true });
}

onMounted(() => {
  window.addEventListener('forceRemountIntegrations', remount);
});

onUnmounted(() => {
  unmount();
  window.removeEventListener('forceRemountIntegrations', remount);
});

watch(
  () => props.modelValue,
  () => {
    if (!integrationsApp.value) {
      console.log('[integrations] shared store on mount', sharedStore);
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeIntegrations.value?.reset() : unmount();
    }
  },
);
</script>

<template>
  <LoadingModule
    data-testid="integrations-loading"
    :isModuleRoute="isIntegrationsRoute"
    :hasModuleApp="!!integrationsApp"
  />
  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-if="!useIframe"
      v-show="integrationsApp && isIntegrationsRoute"
      id="integrations-app"
      class="system-integrations__system"
      data-testid="integrations-app"
    />
    <ExternalSystem
      v-else
      v-show="isIntegrationsRoute"
      ref="iframeIntegrations"
      data-testid="integrations-iframe"
      :routes="['integrations']"
      class="system-integrations__iframe"
      dontUpdateWhenChangesLanguage
      name="integrations"
    />
  </template>
</template>

<style scoped lang="scss">
.system-integrations__system {
  height: 100%;
}
.system-integrations__loading {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.system-integrations__iframe {
  flex: 1;
  overflow: auto;
}
</style>

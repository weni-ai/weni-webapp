<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import ExternalSystem from './ExternalSystem.vue';
import { tryImportWithRetries } from '../utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useFeatureFlagsStore } from '../store/featureFlags';

const insightsApp = ref(null);
const useIframe = ref(false);
const iframeInsights = ref(null);

const isInsightsRoute = computed(() => ['insights'].includes(route.name));

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const sharedStore = useSharedStore();
const featureFlagsStore = useFeatureFlagsStore();

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  if (!featureFlagsStore.flags.insightsMF) {
    fallbackToIframe();
    return;
  }

  const mountInsightsApp = await tryImportWithRetries(
    () => import('insights/main'),
    'insights/main',
  );

  if (!mountInsightsApp) {
    fallbackToIframe();
    return;
  }

  insightsApp.value = await mountInsightsApp({
    containerId: 'insights-app',
    routerBase: `/projects/${sharedStore.current.project.uuid}/insights`,
  });
}

function fallbackToIframe() {
  useIframe.value = true;
  nextTick(() => {
    iframeInsights.value?.init(route.params);
  });
}

function unmount() {
  insightsApp.value?.unmount();
  insightsApp.value = null;
}

function remount() {
  unmount();
  nextTick(() => {
    mount({ force: true });
  });
}

onMounted(() => {
  window.addEventListener('forceRemountInsights', remount);
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !insightsApp.value) {
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeInsights.value?.reset() : unmount();
    }
  },
);

onUnmounted(() => {
  unmount();

  window.removeEventListener('forceRemountInsights', remount);
});
</script>

<template>
  <LoadingModule
    :isModuleRoute="isInsightsRoute"
    :hasModuleApp="!!insightsApp"
    :useIframe="useIframe"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-if="!useIframe"
      v-show="insightsApp && isInsightsRoute"
      id="insights-app"
      class="system-insights__system"
      data-testid="insights-app"
    />
    <ExternalSystem
      v-else
      v-show="isInsightsRoute"
      ref="iframeInsights"
      data-testid="insights-iframe"
      :routes="['insights']"
      class="system-insights__iframe"
      dontUpdateWhenChangesLanguage
      name="insights"
    />
  </template>
</template>

<style scoped lang="scss">
.system-insights__system {
  height: 100%;
}

.system-insights__iframe {
  flex: 1;
  overflow: auto;
}
</style>

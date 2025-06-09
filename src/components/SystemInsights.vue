<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ExternalSystem from './ExternalSystem.vue';
import { safeImport } from '../utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';

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

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) return;

  const mountInsightsApp = await safeImport(
    () => import('insights/main'),
    'insights/main',
  );

  if (JSON.stringify(mountInsightsApp) === '{}') {
    console.error('mountInsightsApp is undefined');

    useIframe.value = true;
    nextTick(() => {
      iframeInsights.value?.init(route.params);
    });

    return;
  }

  insightsApp.value = await mountInsightsApp({
    containerId: 'insights-app',
    routerBase: `/projects/${sharedStore.current.project.uuid}/insights`,
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
    if (!insightsApp.value) {
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
  <template v-if="$keycloak.token && $store.getters.currentProject?.uuid">
    <section
      v-if="!insightsApp && isInsightsRoute && !useIframe"
      class="system-insights__loading"
    >
      <img
        width="64"
        src="../assets/LogoWeniAnimada4.svg"
      />
    </section>
    <section
      v-if="!useIframe"
      v-show="insightsApp && isInsightsRoute"
      id="insights-app"
      class="system-insights__system"
    />
    <ExternalSystem
      v-else
      v-show="isInsightsRoute"
      ref="iframeInsights"
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

.system-insights__loading {
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.system-insights__iframe {
  flex: 1;
  overflow: auto;
}
</style>

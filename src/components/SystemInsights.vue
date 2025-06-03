<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ExternalSystem from './ExternalSystem.vue';
import { safeImport } from '../utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';

const insightsApp = ref(null);
const useIframe = ref(false);

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
  insightsApp.value = await mountInsightsApp({
    containerId: 'insights-app',
    routerBase: `/projects/${sharedStore.current.project.uuid}/insights`,
  });

  if (!mountInsightsApp) {
    console.error('mountInsightsApp is undefined');

    useIframe.value = true;
  }
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
  mount();

  window.addEventListener('forceRemountInsights', remount);
});

watch(
  () => props.modelValue,
  () => mount(),
  { once: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid && oldProjectUuid && newProjectUuid !== oldProjectUuid) {
      remount();
    }
  },
);

watch(
  () => route,
  () => {
    const internalParam = route.params?.internal?.[0];
    if (['r', 'force'].includes(internalParam)) {
      remount();
    }
  },
  { deep: true },
);

onUnmounted(() => {
  unmount();

  window.removeEventListener('forceRemountInsights', remount);
});
</script>

<template>
  <template v-if="$keycloak.token && $store.getters.currentProject?.uuid">
    <section
      v-if="!insightsApp && isInsightsRoute"
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
      ref="system-insights"
      :routes="['insights']"
      class="page"
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
</style>

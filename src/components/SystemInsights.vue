<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';

import ExternalSystem from './ExternalSystem.vue';
import { safeImport } from '../utils/moduleFederation';
import { useRoute } from 'vue-router';

const insightsApp = ref(null);
const useIframe = ref(false);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

async function mount() {
  const mountInsightsApp = await safeImport(
    () => import('insights/main'),
    'insights/main',
  );
  insightsApp.value = await mountInsightsApp('insights-app');

  if (!mountInsightsApp) {
    console.error('mountInsightsApp is undefined');

    useIframe.value = true;
  }
}

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue) mount();
  },
  { immediate: true, once: true },
);

watch(
  () => route,
  () => {
    if (['r', 'force'].includes(route.params?.internal?.[0])) {
      insightsApp.value?.unmount();
      nextTick(() => {
        mount();
      });
    }
  },
  { deep: true },
);

onUnmounted(() => {
  insightsApp.value?.unmount();
  insightsApp.value = null;
});
</script>

<template>
  <template v-if="$keycloak.token && $store.getters.currentProject?.uuid">
    <section
      v-if="!insightsApp && ['insights'].includes(route.name)"
      class="system-insights__loading"
    >
      <img
        width="64"
        src="../assets/LogoWeniAnimada4.svg"
      />
    </section>
    <section
      v-if="!useIframe"
      v-show="insightsApp"
      id="insights-app"
      class="system-insights__system"
    />
    <ExternalSystem
      v-else
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

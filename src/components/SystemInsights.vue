<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import ExternalSystem from './ExternalSystem.vue';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import { createShadowStyleObserver } from '@/utils/shadowDomStyles';
import { ShadowStyle } from '@/utils/shadow';
import getEnv from '../utils/env';

const insightsApp = ref(null);
const insightsAppDOM = ref(null);
const shadowRootRef = ref(null);
const modalPortalContainer = ref(null);

const insightsRouter = ref(null);
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

const { getInitialModuleRoute } = useModuleUpdateRoute('insights');

const styleObserver = createShadowStyleObserver('Insights');

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  const mountInsightsApp = await tryImportWithRetries(
    () => import('insights/main'),
    'insights/main',
  );

  console.log('📦 [Insights] mountInsightsApp loaded', mountInsightsApp);

  if (!mountInsightsApp) {
    fallbackToIframe();
    return;
  }

  const initialRoute = getInitialModuleRoute();

  await nextTick();

  const shadowRoot = shadowRootRef.value?.$el?.shadowRoot;

  if (!shadowRoot) {
    console.error('[Insights] Shadow Root not found');
    return;
  }

  const insightsUrl = getEnv('MODULE_FEDERATION_INSIGHTS_URL');
  styleObserver.start(shadowRoot, insightsUrl);

  const { app, router } = await mountInsightsApp({
    container: insightsAppDOM.value,
    initialRoute,
    shadowRoot: shadowRoot,
    modalContainer: modalPortalContainer.value,
  });

  console.log('📦 [Insights] App mounted', app);

  insightsApp.value = app;
  insightsRouter.value = router;
}

function fallbackToIframe() {
  useIframe.value = true;
  nextTick(() => {
    iframeInsights.value?.init(route.params);
  });
}

function unmount() {
  styleObserver.stop();
  insightsApp.value?.unmount();
  insightsApp.value = null;
}

async function remount() {
  await insightsRouter.value.replace({ name: 'home' });
  unmount();
  await nextTick();
  mount({ force: true });
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
    data-testid="insights-loading"
    :isModuleRoute="isInsightsRoute"
    :hasModuleApp="!!insightsApp"
    :useIframe="useIframe"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <ShadowRoot
      v-show="insightsApp && isInsightsRoute"
      ref="shadowRootRef"
      class="system-insights__shadow-root"
    >
      <ShadowStyle>
        .system-insights__system { height: 100%; width: 100%; }
      </ShadowStyle>
      <section
        v-if="!useIframe"
        id="insights-app"
        ref="insightsAppDOM"
        class="system-insights__system"
        data-testid="insights-app"
      />
      <div
        id="insights-portal"
        ref="modalPortalContainer"
      />
    </ShadowRoot>
    <ExternalSystem
      v-if="useIframe"
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
  width: 100%;
}

.system-insights__iframe {
  flex: 1;
  overflow: auto;
}

.system-insights__shadow-root {
  height: 100%;
  width: 100%;
}
</style>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ExternalSystem from './ExternalSystem.vue';
import { tryImportWithRetries } from '../utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import LogoWeniAnimada4 from '@/assets/LogoWeniAnimada4.svg';

const integrationsApp = ref(null);
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

  integrationsApp.value = await mountIntegrationsApp({
    containerId: 'integrations-app',
    routerBase: `/projects/${sharedStore.current.project.uuid}/integrations/init`,
  });
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

function remount() {
  unmount();
  nextTick(() => {
    mount({ force: true });
  });
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
  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-if="!integrationsApp && isIntegrationsRoute && !useIframe"
      class="system-integrations__loading"
      data-testid="integrations-loading"
    >
      <img
        width="64"
        :src="LogoWeniAnimada4"
        data-testid="integrations-loading-image"
      />
    </section>
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

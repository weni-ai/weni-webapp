<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';

const bulkSendApp = ref(null);
const bulkSendRouter = ref(null);
const routerUnsubscribe = ref(null);

const isBulkSendRoute = computed(() => ['bulkSend'].includes(route.name));

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const sharedStore = useSharedStore();

const { getInitialModuleRoute } = useModuleUpdateRoute('bulkSend');

function setupRouterSync() {
  if (routerUnsubscribe.value) {
    routerUnsubscribe.value();
  }

  if (!bulkSendRouter.value) {
    return;
  }

  routerUnsubscribe.value = bulkSendRouter.value.afterEach((to) => {
    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: `bulkSend${to.path}`,
          query: to.query || {},
        },
      }),
    );
  });
}

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  const mountBulkSendApp = await tryImportWithRetries(
    () => import('bulk_send/main'),
    'bulk_send/main',
  );

  if (!mountBulkSendApp) {
    console.error('Failed to mount bulk send app');
    return;
  }

  const initialRoute = getInitialModuleRoute();

  const { app, router } = await mountBulkSendApp({
    containerId: 'bulk-send-app',
    initialRoute,
  });

  bulkSendApp.value = app;
  bulkSendRouter.value = router;

  setupRouterSync();
}

function unmount() {
  if (routerUnsubscribe.value) {
    routerUnsubscribe.value();
    routerUnsubscribe.value = null;
  }

  bulkSendApp.value?.unmount();
  bulkSendApp.value = null;
  bulkSendRouter.value = null;
}

async function remount() {
  await bulkSendRouter.value.replace({ name: 'home' });
  unmount();
  await nextTick();
  mount({ force: true });
}

onMounted(() => {
  window.addEventListener('forceRemountBulkSend', remount);
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !bulkSendApp.value) {
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

  window.removeEventListener('forceRemountBulkSend', remount);
});
</script>

<template>
  <LoadingModule
    data-testid="bulk-send-loading"
    :isModuleRoute="isBulkSendRoute"
    :hasModuleApp="!!bulkSendApp"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-show="bulkSendApp && isBulkSendRoute"
      id="bulk-send-app"
      class="system-bulk-send__system"
      data-testid="bulk-send-app"
    />
  </template>
</template>

<style scoped lang="scss">
.system-bulk-send__system {
  height: 100%;
}
</style>

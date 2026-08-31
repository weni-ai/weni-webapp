<script setup>
import { toRef } from 'vue';

import LoadingModule from './LoadingModule.vue';
import { useFederatedModule } from '@/composables/useFederatedModule';

const props = defineProps({
  moduleName: {
    type: String,
    required: true,
  },
  importFn: {
    type: Function,
    required: true,
  },
  importPath: {
    type: String,
    required: true,
  },
  containerId: {
    type: String,
    required: true,
  },
  routeNames: {
    type: Array,
    required: true,
  },
  forceRemountEvent: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  inactivityTimeout: {
    type: Number,
    default: null,
  },
  activeModuleTracking: {
    type: Boolean,
    default: false,
  },
  systemClass: {
    type: String,
    default: '',
  },
  updateRoutePathPrefixes: {
    type: Array,
    default: () => [],
  },
});

const {
  app,
  moduleRouter,
  routerUnsubscribe,
  useIframe,
  iframeRef,
  isModuleRoute,
  sharedStore,
  mount, // eslint-disable-line no-unused-vars
  unmount, // eslint-disable-line no-unused-vars
} = useFederatedModule({
  moduleName: props.moduleName,
  importFn: props.importFn,
  importPath: props.importPath,
  containerId: props.containerId,
  routeNames: props.routeNames,
  forceRemountEvent: props.forceRemountEvent,
  modelValue: toRef(props, 'modelValue'),
  inactivityTimeout: props.inactivityTimeout,
  activeModuleTracking: props.activeModuleTracking,
  updateRoutePathPrefixes: props.updateRoutePathPrefixes,
});

defineExpose({
  app,
  moduleRouter,
  routerUnsubscribe,
  useIframe,
  iframeRef,
  isModuleRoute,
  sharedStore,
  mount,
  unmount,
});
</script>

<template>
  <LoadingModule
    :data-testid="`${moduleName}-loading`"
    :isModuleRoute="modelValue"
    :hasModuleApp="!!app"
    :useIframe="useIframe"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <section
      v-if="!useIframe"
      v-show="app && modelValue"
      :id="containerId"
      :class="systemClass"
      :data-testid="`${moduleName}-app`"
    />
  </template>
</template>

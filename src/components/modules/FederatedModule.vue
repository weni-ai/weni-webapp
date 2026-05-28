<script setup>
import { ref, toRef } from 'vue';

import LoadingModule from './LoadingModule.vue';
import ExternalSystem from '../ExternalSystem.vue';
import { useFederatedModule } from '@/composables/useFederatedModule';
import { useSharedProjectContext } from '@/store/Shared';

const containerRef = ref(null);
const { canLoadFederatedModule } = useSharedProjectContext();

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
  iframeFallback: {
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
  iframeRoutes: {
    type: Array,
    default: null,
  },
  iframeName: {
    type: String,
    default: '',
  },
  iframeDontUpdateWhenChangesLanguage: {
    type: Boolean,
    default: false,
  },
  systemClass: {
    type: String,
    default: '',
  },
  iframeClass: {
    type: String,
    default: '',
  },
  remountRoute: {
    type: Object,
    default: null,
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
  iframeFallback: props.iframeFallback,
  inactivityTimeout: props.inactivityTimeout,
  activeModuleTracking: props.activeModuleTracking,
  remountRoute: props.remountRoute,
  containerRef,
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

  <section
    v-if="!useIframe && modelValue"
    :id="containerId"
    ref="containerRef"
    :class="systemClass"
    :data-testid="`${moduleName}-app`"
  />

  <template v-if="canLoadFederatedModule">
    <ExternalSystem
      v-if="useIframe && iframeFallback"
      v-show="modelValue"
      ref="iframeRef"
      :data-testid="`${moduleName}-iframe`"
      :routes="iframeRoutes || routeNames"
      :class="iframeClass"
      :dontUpdateWhenChangesLanguage="iframeDontUpdateWhenChangesLanguage"
      :name="iframeName"
    />
  </template>
</template>

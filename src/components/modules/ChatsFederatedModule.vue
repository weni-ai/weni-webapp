<script setup>
import { toRef } from 'vue';

import LoadingModule from './LoadingModule.vue';
import ExternalSystem from '../ExternalSystem.vue';
import { useChatsFederatedModule } from '@/composables/useChatsFederatedModule';

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
  routeNameForUpdateRoute: {
    type: String,
    default: '',
  },
  basePath: {
    type: String,
    default: '',
  },
  updateRoutePathPrefixes: {
    type: Array,
    default: () => [],
  },
  defaultHomeRoute: {
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
} = useChatsFederatedModule({
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
  routeNameForUpdateRoute: props.routeNameForUpdateRoute,
  basePath: props.basePath,
  updateRoutePathPrefixes: props.updateRoutePathPrefixes,
  defaultHomeRoute: props.defaultHomeRoute,
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
  <div class="chats-federated-module">
    <LoadingModule
      :data-testid="`${moduleName}-loading`"
      :isModuleRoute="modelValue"
      :hasModuleApp="!!app"
      :useIframe="useIframe"
    />

    <section
      v-if="!useIframe"
      v-show="app && modelValue"
      :id="containerId"
      :class="systemClass"
      :data-testid="`${moduleName}-app`"
    />

    <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
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
  </div>
</template>

<style scoped lang="scss">
.chats-federated-module {
  height: 100%;
  width: 100%;
}
</style>

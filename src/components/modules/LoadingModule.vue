<template>
  <section
    v-if="
      isModuleRoute &&
      (!sharedStore.auth.token ||
        !sharedStore.current.project.uuid ||
        (!hasModuleApp && !useIframe))
    "
    class="loading-module"
    data-testid="loading-modules"
  >
    <img
      width="64"
      :src="LogoWeniAnimada4"
      data-testid="loading-modules-image"
    />
  </section>
</template>

<script setup>
import LogoWeniAnimada4 from '@/assets/LogoWeniAnimada4.svg';
import { useSharedStore } from '@/store/Shared';

const sharedStore = useSharedStore();

defineProps({
  isModuleRoute: {
    type: Boolean,
    default: false,
  },
  hasModuleApp: {
    type: Boolean,
    default: false,
  },
  useIframe: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped lang="scss">
.loading-module {
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

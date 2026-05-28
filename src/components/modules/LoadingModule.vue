<template>
  <section
    v-if="
      isModuleRoute &&
      (!canLoadFederatedModule || (!hasModuleApp && !useIframe))
    "
    class="loading-module"
    data-testid="loading-modules"
  >
    <UnnnicIconLoading
      size="64px"
      data-testid="loading-modules-image"
    />
  </section>
</template>

<script setup>
import { useSharedProjectContext } from '@/store/Shared';

const { canLoadFederatedModule } = useSharedProjectContext();

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

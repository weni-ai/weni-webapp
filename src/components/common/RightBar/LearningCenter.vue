<template>
  <section>
    <Resources @redirected="$emit('close')" />

    <template v-if="projectSelected">
      <hr />

      <ChampionChatbot />
    </template>
  </section>
</template>

<script setup>
import Resources from './LearningCenterResources.vue';
import ChampionChatbot from './LearningCenterChampionChatbot.vue';
import { computed, getCurrentInstance } from 'vue';

const instance = getCurrentInstance();

function use(name) {
  return computed(() => {
    const { proxy } = instance;
    const item = proxy[`$${name}`];
    return item;
  });
}

const route = use('route');

const projectSelected = computed(() => {
  return route.value.params?.projectUuid;
});
</script>

<style lang="scss" scoped>
hr {
  margin-block: $unnnic-spacing-md - $unnnic-border-width-thinner
    $unnnic-spacing-md;

  border-width: 0;
  border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
}
</style>

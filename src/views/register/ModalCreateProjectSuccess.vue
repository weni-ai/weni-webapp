<template>
  <UnnnicModal
    persistent
    :closeIcon="false"
    class="modal"
    @close="$emit('close')"
  >
    <section class="modal__image-container">
      <img :src="image" />
    </section>

    <h3 class="modal__title">
      {{ $t('register.modals.success.title') }}
    </h3>

    <p
      v-if="hasBrainError"
      class="modal__description"
      v-html="$t('register.modals.success.brain_error')"
    />

    <footer class="modal__actions">
      <UnnnicButton @click="redirectToTheProject">
        {{ $t('register.modals.success.start') }}
      </UnnnicButton>
    </footer>
  </UnnnicModal>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

import AmazoninhaStarryEyes from '@/assets/amazoninha-starry-eyes.png';
import AmazoninhaThumbsUp from '@/assets/amazoninha-thumbs-up.png';

const emit = defineEmits('close');

const instance = getCurrentInstance();

const props = defineProps({
  createdBrain: Boolean,
  hasBrainError: Boolean,
  projectUuid: String,
});

const image = computed(() => {
  if (props.hasBrainError) {
    return AmazoninhaThumbsUp;
  }

  return AmazoninhaStarryEyes;
});

function redirectToTheProject() {
  const router = instance.proxy['$router'];

  emit('close');

  if (props.createdBrain) {
    router.push({
      name: 'agent-builder',
      params: {
        projectUuid: props.projectUuid,
        internal: ['init'],
      },
    });
  } else {
    router.push({
      name: 'home',
      params: {
        projectUuid: props.projectUuid,
      },
    });
  }
}
</script>

<style lang="scss" scoped>
.modal {
  :deep(.unnnic-modal-container-background) {
    $modal-width: 25 * $unnnic-font-size;

    width: $modal-width;
  }

  :deep(.unnnic-modal-container-background-body-description-container) {
    padding: 0;
  }

  &__image-container {
    margin-top: $unnnic-spacing-xs;
    margin-bottom: $unnnic-spacing-md;
  }

  &__title,
  &__description {
    padding-inline: $unnnic-spacing-md;
  }

  &__title {
    margin: 0;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-black;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  }

  &__description {
    margin: 0;
    margin-top: $unnnic-spacing-xs;

    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__actions {
    display: flex;
    gap: $unnnic-spacing-sm;

    margin-top: $unnnic-spacing-md;
    padding: $unnnic-spacing-md;
    padding-top: $unnnic-spacing-md - $unnnic-border-width-thinner;
    border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    > * {
      flex: 1;
    }
  }
}
</style>

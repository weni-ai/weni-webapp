<template>
  <UnnnicModal :closeIcon="true" class="modal" @close="$emit('close')">
    <section class="modal__image-container">
      <img :src="AmazoninhaStarryEyes" />
    </section>

    <h3 class="modal__title">
      {{ title }}
    </h3>

    <p class="modal__description">
      {{ description }}
    </p>

    <footer class="modal__actions">
      <UnnnicButton @click="emit('redirect')">
        {{ buttonText }}
      </UnnnicButton>
    </footer>
  </UnnnicModal>
</template>

<script setup>
import AmazoninhaStarryEyes from '@/assets/amazoninha-starry-eyes.png';

const emit = defineEmits(['close', 'redirect']);

const props = defineProps({
  title: String,
  description: String,
  buttonText: String,
});
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

    >* {
      flex: 1;
    }
  }
}
</style>

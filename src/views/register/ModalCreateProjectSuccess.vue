<template>
  <UnnnicModal
    @close="$emit('close')"
    persistent
    :closeIcon="false"
    class="modal"
  >
    <section class="image-container">
      <img :src="image" />
    </section>

    <h3 class="title">
      {{ $t('register.modals.success.title') }}
    </h3>

    <p
      v-if="hasBrainError"
      class="description"
      v-html="$t('register.modals.success.brain_error')"
    />

    <footer class="actions">
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

  if (props.createdBrain) {
    router.push({
      name: 'brain',
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
}

.image-container {
  margin-top: $unnnic-spacing-xs;
  margin-bottom: $unnnic-spacing-md;
}

.title,
.description {
  padding-inline: $unnnic-spacing-md;
}

.title {
  margin: 0;

  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-black;
  font-size: $unnnic-font-size-title-sm;
  line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
}

.description {
  margin: 0;
  margin-top: $unnnic-spacing-xs;

  color: $unnnic-color-neutral-cloudy;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
}

.actions {
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
</style>

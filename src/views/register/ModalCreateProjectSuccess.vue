<template>
  <UnnnicDialog :open="open">
    <UnnnicDialogContent>
      <section class="modal-create-project-success__content">
        <img
          class="modal-create-project-success__image"
          :src="image"
        />

        <UnnnicDialogTitle>
          {{ $t('register.modals.success.title') }}
        </UnnnicDialogTitle>

        <p
          v-if="hasBrainError"
          class="modal-create-project-success__description"
          v-html="$t('register.modals.success.brain_error')"
        />
      </section>
      <UnnnicDialogFooter>
        <UnnnicButton
          type="primary"
          :text="$t('register.modals.success.start')"
          @click="redirectToTheProject"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';
import { useFeatureFlagsStore } from '@/store/featureFlags';

import AmazoninhaStarryEyes from '@/assets/amazoninha-starry-eyes.png';
import AmazoninhaThumbsUp from '@/assets/amazoninha-thumbs-up.png';

const featureFlagsStore = useFeatureFlagsStore();

const open = defineModel('open', { type: Boolean, default: false });

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

const isAgentBuilder2 = computed(() => {
  return featureFlagsStore.flags.agentsTeam;
});

function redirectToTheProject() {
  const router = instance.proxy['$router'];

  open.value = false;

  if (props.createdBrain) {
    router.push({
      name: isAgentBuilder2.value ? 'aiBuildInit' : 'agentBuilderInit',
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

<style lang="scss">
.modal-create-project-success {
  display: flex;
  gap: $unnnic-space-4;
  align-items: center;
}
</style>

<style lang="scss" scoped>
.modal-create-project-success {
  &__content {
    padding: $unnnic-space-6;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-space-4;
  }

  &__image {
    height: 150px;
    object-fit: none;
  }

  &__description {
    text-align: center;
    color: $unnnic-color-fg-base;
  }
}
</style>

<template>
  <UnnnicPopoverOption
    class="project-item"
    :label="project.name"
    :active="isActive"
    role="option"
    :aria-selected="isActive"
    tabindex="0"
    @click="$emit('select', project)"
    @keydown.enter.prevent="$emit('select', project)"
    @keydown.space.prevent="$emit('select', project)"
  >
    <span class="project-item__name">{{ project.name }}</span>
    <UnnnicTag
      :text="statusLabel"
      :scheme="tagScheme"
      size="small"
    />
  </UnnnicPopoverOption>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const PROJECT_STATUS_IN_TEST = 'IN_TEST';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['select']);

const { t } = useI18n();

const isTest = computed(() => props.project.status === PROJECT_STATUS_IN_TEST);

const statusLabel = computed(() =>
  isTest.value ? t('NAVBAR.STATUS_IN_TEST') : t('NAVBAR.STATUS_ACTIVE'),
);

const tagScheme = computed(() => (isTest.value ? 'aux-orange' : 'aux-green'));
</script>

<style lang="scss" scoped>
.project-item {
  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    @include unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;
  }

  &.unnnic-popover-option--active .project-item__name {
    color: $unnnic-color-fg-on-primary;
  }
}
</style>

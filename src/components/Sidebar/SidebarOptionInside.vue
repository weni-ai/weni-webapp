<template>
  <UnnnicToolTip
    class="tooltip"
    :enabled="enableTooltip"
    :text="tooltipText || title"
    side="right"
  >
    <component
      data-test="option-inside"
      :is="tag"
      :class="[
        'option',
        `option--align-${align}`,
        `option--variant-${variant}`,
        {
          'option--disabled': disabled,
          'option--selected': selected,
          'option--expanded': expanded,
        },
      ]"
      :href="href"
      @click="$emit('click', $event)"
    >
      <UnnnicIcon
        v-if="icon"
        :icon="icon"
        size="md"
        scheme="inherit"
        class="option__icon"
        :class="{
          'option__icon--rotate-180deg': iconRotate180deg,
        }"
        :filled="variant === 'normal' && selected"
      />

      <span
        ref="titleElement"
        class="option__title"
        :class="{
          'option__title--use-ellipsis': useEllipsis,
        }"
      >
        {{ title }}
      </span>

      <i
        v-if="label"
        class="option__tag"
      >
        {{ label }}
      </i>

      <section
        v-if="hasNotification"
        :class="[
          'option__notification',
          { 'option__notification--spaced': expanded },
        ]"
      />

      <UnnnicIcon
        v-if="iconRight"
        data-test="icon-right"
        class="option__right-icon"
        :class="{ 'option__right-icon--rotate-180deg': iconRightRotate180deg }"
        :icon="iconRight"
        size="md"
        scheme="inherit"
      />
    </component>
  </UnnnicToolTip>
</template>

<script>
export default {
  name: 'SidebarOptionInside',
};
</script>

<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  enableTooltip: Boolean,
  tooltipText: String,
  tag: String,
  href: String,

  align: {
    type: String,
    default: 'left',
  },

  variant: {
    type: String,
    default: 'normal',
  },

  disabled: Boolean,
  selected: Boolean,
  expanded: Boolean,
  useEllipsis: Boolean,

  icon: String,
  iconRotate180deg: Boolean,

  iconRight: String,
  iconRightRotate180deg: Boolean,

  title: String,
  label: String,
  hasNotification: Boolean,

  isAccordion: Boolean,
});

const titleElement = ref();
const tooltipLeft = ref('0px');

const iconRight = computed(
  () => props.iconRight || (props.isAccordion && 'keyboard_arrow_down'),
);

onMounted(() => {
  const { offsetLeft: left, offsetWidth: width } = titleElement.value;
  const spacingXs = 8;

  tooltipLeft.value = `${left + width + spacingXs}px`;
});
</script>

<style lang="scss" scoped>
.tooltip.unnnic-tooltip {
  display: block;

  :deep(.unnnic-tooltip-label) {
    margin-left: $unnnic-spacing-sm;
  }
}

.option {
  text-decoration: none;

  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;

  user-select: none;
  cursor: pointer;

  padding: $unnnic-spacing-xs;
  border-radius: $unnnic-border-radius-sm;

  white-space: nowrap;
  overflow: hidden;

  color: transparent;
  transition: color 200ms;

  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

  &--variant-outline {
    padding: $unnnic-spacing-xs - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-darkest;
  }

  &--align-center {
    justify-content: center;
  }

  &--disabled {
    cursor: not-allowed;

    .option__icon,
    .option__title {
      color: $unnnic-color-neutral-dark;
    }
  }

  &__icon {
    color: $unnnic-color-neutral-clean;
    transition: transform 200ms;

    &--rotate-180deg {
      transform: rotate(-180deg);
    }
  }

  &__right-icon {
    margin-left: auto;
    color: $unnnic-color-neutral-light;
    transition: transform 200ms;

    &--rotate-180deg {
      transform: rotate(180deg);
    }
  }

  &__tag {
    margin-left: -$unnnic-spacing-nano;
    color: $unnnic-color-weni-200;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__title--use-ellipsis {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__notification {
    position: absolute;

    transition: all 200ms;

    left: 1.5625 * $unnnic-font-size;
    margin-top: -$unnnic-font-size;
    width: 0.5 * $unnnic-font-size;
    height: 0.5 * $unnnic-font-size;
    border-radius: $unnnic-border-radius-pill;
    background-color: $unnnic-color-weni-600;

    &--spaced {
      left: v-bind(tooltipLeft);
      margin-top: 0;
    }
  }
}

.option.option--expanded {
  color: $unnnic-color-neutral-light;

  &.option--variant-static {
    color: $unnnic-color-neutral-clean;
  }

  &.option--variant-normal.option--selected,
  &.option--variant-dropdown-content.option--selected {
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-weni-500;
  }
}

.option--variant-normal,
.option--variant-static {
  &:hover:not(.option--disabled),
  &.option--selected {
    background-color: $unnnic-color-neutral-darkest;
  }

  &.option--selected .option__icon {
    color: $unnnic-color-weni-500;
  }
}

.option--variant-dropdown-content {
  &:hover:not(.option--disabled),
  &.option--selected {
    background-color: $unnnic-color-neutral-dark;
  }
}

.option--variant-outline {
  &:hover:not(.option--disabled),
  &.option--selected {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-clean;
  }
}
</style>

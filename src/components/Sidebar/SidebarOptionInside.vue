<template>
  <UnnnicToolTip
    class="sidebar-option-tooltip"
    :enabled="enableTooltip"
    :text="tooltipText || title"
    side="right"
    :contentProps="{
      sideOffset: 16, // TODO: get this value from the design system when it's available
    }"
  >
    <component
      :is="tag"
      data-test="option-inside"
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

      <section
        :class="[
          'option__title',
          {
            'option__title-active': label === $t('SIDEBAR.ACTIVE'),
          },
        ]"
        :data-test="`sidebar-option-inside-${title}`"
      >
        <span
          ref="titleElement"
          :class="{
            'option__title--use-ellipsis': useEllipsis,
          }"
        >
          {{ title }}
        </span>

        <i
          v-if="label"
          :class="[
            'option__tag',
            {
              'option__tag-active': label === $t('SIDEBAR.ACTIVE'),
            },
          ]"
        >
          {{ label }}
        </i>
      </section>

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

defineEmits(['click']);

const titleElement = ref();
const tooltipLeft = ref('0px');

const iconRight = computed(
  () => props.iconRight || (props.isAccordion && 'keyboard_arrow_down'),
);

onMounted(() => {
  const { offsetLeft: left, offsetWidth: width } = titleElement.value;
  const spacingXs = 12;

  tooltipLeft.value = `${left + width + spacingXs}px`;
});
</script>

<style lang="scss">
.sidebar-option-tooltip {
  &.unnnic-tooltip-trigger.unnnic-tooltip {
    display: block;
  }
}
</style>

<style lang="scss" scoped>
$icon-size: 22px; // This size does not exists in Design System
$icon-padding: ($unnnic-space-2 * 2);
$icon-container-size: calc($icon-size + $icon-padding);

.option {
  height: $icon-container-size;
  min-width: $icon-container-size;
  box-sizing: border-box;

  text-decoration: none;

  display: flex;
  align-items: center;
  column-gap: $unnnic-space-3;

  user-select: none;
  cursor: pointer;

  padding: $unnnic-spacing-xs;
  border-radius: $unnnic-radius-2;

  white-space: nowrap;
  overflow: hidden;

  color: transparent;
  transition:
    color 200ms,
    background-color 50ms;

  font: $unnnic-font-emphasis;
  line-height: $unnnic-font-size-body-sm + $unnnic-line-height-md;

  :deep(.unnnic-icon) {
    font-size: $icon-size;
    min-width: $icon-size;
    min-height: $icon-size;
  }

  &__title {
    overflow: hidden;
    display: flex;
    column-gap: $unnnic-spacing-nano;
    align-items: baseline;

    &-active {
      align-items: center;
    }
  }

  &--variant-outline {
    padding: $unnnic-spacing-xs - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-border-base;
  }

  &--align-center {
    justify-content: center;
  }

  &--disabled {
    cursor: not-allowed;

    .option__icon,
    .option__title {
      color: $unnnic-color-fg-muted;
    }
  }

  &__icon {
    color: $unnnic-color-fg-base;
    transition: transform 200ms;

    &--rotate-180deg {
      transform: rotate(-180deg);
    }
  }

  &__right-icon {
    margin-left: auto;
    color: $unnnic-color-fg-base;
    transition: transform 200ms;

    &--rotate-180deg {
      transform: rotate(180deg);
    }
  }

  &__tag {
    color: $unnnic-color-teal-200;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    &-active {
      display: flex;
      padding: 0 $unnnic-spacing-nano;
      justify-content: center;
      align-items: center;
      border-radius: $unnnic-spacing-nano;
      background-color: $unnnic-color-teal-600;
      color: $unnnic-color-teal-50;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-sm;
      font-weight: $unnnic-font-weight-bold;
      font-style: normal;
      line-height: $unnnic-line-height-md + $unnnic-font-size-body-sm;
    }
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
    background-color: $unnnic-color-teal-600;

    &--spaced {
      left: v-bind(tooltipLeft);
      margin-top: 0;
    }
  }
}

.option.option--expanded {
  color: $unnnic-color-fg-base;

  &.option--variant-static {
    color: $unnnic-color-fg-base;
  }

  &.option--variant-normal.option--selected,
  &.option--variant-dropdown-content.option--selected {
    color: $unnnic-color-fg-base;
  }
}

.option--variant-normal,
.option--variant-static {
  &:hover:not(.option--disabled),
  &.option--selected {
    background-color: $unnnic-color-bg-muted;
  }

  &.option--selected .option__icon {
    color: $unnnic-color-fg-accent;
  }
}

.option--variant-dropdown-content {
  &:hover:not(.option--disabled),
  &.option--selected {
    background-color: $unnnic-color-bg-muted;
  }
}

.option--variant-outline {
  &:hover:not(.option--disabled),
  &.option--selected {
    border: $unnnic-border-width-thinner solid $unnnic-color-border-base;
  }
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :class="['alert', `scheme--${scheme}`, { clickable }]"
    @click="
      if (clickable) {
        $emit('click');
      }
    "
  >
    <UnnnicIconSvg
      :class="['icon', { spin: iconSpin }]"
      :icon="icon"
      :scheme="scheme"
      size="sm"
    />

    <div class="content">
      <div class="title">
        {{ title }}
      </div>

      <div
        class="description"
        v-html="description"
      ></div>
    </div>

    <div
      class="close"
      @click="$emit('close')"
    >
      {{ $t('close').toUpperCase() }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    clickable: Boolean,
    title: String,
    description: String,
    icon: String,
    iconSpin: Boolean,
    scheme: String,
  },
};
</script>

<style lang="scss" scoped>
.alert {
  max-width: 24rem;
  box-sizing: border-box;
  padding: $unnnic-inset-xs;
  user-select: none;

  display: inline-flex;
  align-items: center;

  font-family: $unnnic-font-family-secondary;
  border-radius: $unnnic-border-radius-sm;

  background-color: $unnnic-color-background-carpet;
  box-shadow: $unnnic-shadow-level-near;

  &.clickable {
    cursor: pointer;
  }

  .icon.spin {
    animation: spin 2s linear infinite;
  }

  &.scheme--feedback-yellow {
    .content .title {
      color: $unnnic-color-feedback-yellow;
    }

    :deep(high) {
      color: $unnnic-color-feedback-yellow;
    }
  }

  &.scheme--feedback-blue {
    .content .title {
      color: $unnnic-color-feedback-blue;
    }

    :deep(high) {
      color: $unnnic-color-feedback-blue;
    }
  }

  .content {
    flex: 1;
    margin: 0 $unnnic-inline-xs;

    .title {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-md;
      font-family: $unnnic-font-family-secondary;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;
    }

    .description {
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }

  .close {
    color: $unnnic-color-brand-sec;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;

    margin-left: $unnnic-inline-xs;
    cursor: pointer;
  }
}

@keyframes spin {
  100% {
    transform: rotate(-360deg);
  }
}
</style>

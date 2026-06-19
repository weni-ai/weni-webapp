<template>
  <div class="weni-report">
    <UnnnicIconSvg
      :icon="icon"
      :size="iconSize"
      :scheme="iconScheme"
    />
    <p>{{ text }}</p>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Redirecting',
  props: {
    text: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'alert-circle-1-1',
    },
    iconSize: {
      type: String,
      default: 'ant',
    },
    iconScheme: {
      type: String,
      default: 'feedback-yellow',
    },
  },
};
</script>

<style lang="scss" scoped>
.weni-report {
  display: flex;
  align-items: center;
  background-color: $unnnic-color-bg-base-soft;
  padding: $unnnic-inset-sm;
  border-radius: $unnnic-border-radius-sm;
  border: 1px solid $unnnic-color-border-base;

  p {
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
    margin: 0;
    width: 100%;
    margin-left: $unnnic-spacing-inline-xs;
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-fg-base;
  }
}
</style>

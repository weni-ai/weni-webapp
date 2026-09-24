<template>
  <div class="warning">
    <UnnnicIcon
      icon="alert-circle-1-1"
      size="sm"
      scheme="aux-yellow-300"
    />

    {{ description }}
  </div>
</template>

<script>
export default {
  props: ['description'],
};
</script>

<style lang="scss" scoped>
.warning {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;
  padding: $unnnic-spacing-xs $unnnic-spacing-ant;
  border-radius: $unnnic-border-radius-sm;
  outline-style: solid;
  outline-color: $unnnic-color-border-warning;
  outline-width: 1px;
  outline-offset: -1px;

  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-md;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  color: $unnnic-color-fg-base;

  background-color: rgba(
    $unnnic-color-yellow-5,
    $unnnic-opacity-level-extra-light
  );
}
</style>

<template>
  <div class="container">
    <div :class="['content', { center }]">
      <slot />
    </div>

    <div class="footer" />
  </div>
</template>

<script>
export default {
  props: {
    center: Boolean,
  },
};
</script>

<style lang="scss" scoped>
$font-sizes:
  'h6' $unnnic-font-size-title-md 'h5' $unnnic-font-size-title-lg 'h4'
    $unnnic-font-size-h4,
  'h3' $unnnic-font-size-h3,
  'h2' $unnnic-font-size-h2,
  'h1' $unnnic-font-size-h1;

@each $name, $size in $font-sizes {
  :deep(#{$name}) {
    margin: 0;
    font-family: $unnnic-font-family-primary;
    font-size: $size;
    line-height: $size + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
  }
}

$font-sizes:
  'h4' $unnnic-font-size-h4,
  'h3' $unnnic-font-size-h3,
  'h2' $unnnic-font-size-h2,
  'h1' $unnnic-font-size-h1;

@each $name, $size in $font-sizes {
  #{$name} {
    margin: 0;
    font-size: $size;
    line-height: $size + $unnnic-line-height-md;
  }
}

.container {
  justify-content: space-between;
  display: flex;
  flex-direction: column;

  > .content {
    max-width: 31.25rem;
    margin: 0 auto;
    padding: $unnnic-spacing-stack-xl $unnnic-spacing-inline-sm;

    &.center {
      margin: auto auto;
    }
  }

  .footer {
    width: 100%;
    min-height: $unnnic-border-width-thick * 2;
    background-color: $unnnic-color-brand-weni;
  }
}
</style>

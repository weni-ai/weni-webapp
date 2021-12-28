<template>
  <div
    :style="{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }"
  >
    <div v-if="title || subtitle" class="header grid">
      <div class="title">
        {{ title }}
      </div>

      <div class="subtitle">
        <span v-html="subtitle" />
        <slot name="after-subtitle" />
      </div>
    </div>

    <div :style="{ flex: 1 }">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },

    subtitle: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.header.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  row-gap: $unnnic-spacing-stack-xs;
  column-gap: $unnnic-spacing-inline-sm;
  padding-bottom: $unnnic-spacing-stack-lg;

  .title {
    text-align: center;
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-brand-sec-dark;
    font-weight: $unnnic-font-weight-black;
    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-medium;
    grid-column: 1 / span 12;
  }

  .subtitle {
    text-align: center;
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-neutral-dark;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
    grid-column: 3 / span 8;

    a {
      display: inline-block;
      color: inherit;
    }
  }
}
</style>

<template>
  <div class="billing-container">
    <div v-if="title || subtitle" class="header grid">
      <div
        class="title unnnic-font secondary title-md black color-brand-sec-dark"
      >
        {{ title }}
      </div>

      <div class="subtitle unnnic-font secondary body-lg color-neutral-dark">
        <span v-html="subtitle" />
        <slot name="after-subtitle" />
      </div>
    </div>

    <div class="content-container">
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

.billing-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  .content-container {
    flex: 1;
  }
}

.header.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  row-gap: $unnnic-spacing-stack-xs;
  column-gap: $unnnic-spacing-inline-sm;
  padding-bottom: $unnnic-spacing-stack-lg;

  .title {
    text-align: center;
    grid-column: 1 / span 12;
  }

  .subtitle {
    text-align: center;
    grid-column: 3 / span 8;

    a {
      display: inline-block;
      color: inherit;
    }
  }
}
</style>

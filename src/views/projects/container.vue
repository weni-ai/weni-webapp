<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="screen">
    <div :class="['container', { center }]">
      <div class="unnnic-grid-lg">
        <div :class="['content', type]">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    center: {
      type: Boolean,
    },

    type: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.screen {
  display: flex;
  flex-direction: column;

  .container {
    padding: $unnnic-spacing-stack-xl 12.88%;
    flex: 1;
    border-bottom: $unnnic-border-width-thick * 2 solid $unnnic-color-brand-weni;

    @media only screen and (max-width: 60rem) {
      padding: $unnnic-spacing-stack-xl $unnnic-spacing-inline-sm;
    }

    &.center {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .unnnic-grid-lg {
      padding: 0;
      align-items: center;

      .content {
        grid-column: 4 / span 6;

        &.full {
          grid-column: 1 / span 12;
        }
      }
    }
  }
}
</style>

<template>
  <div class="screen">
    <div :class="['container', { center }]">
      <div class="unnnic-grid-lg">
        <div class="content">
          <slot/>
        </div>
      </div>
    </div>

    <div class="footer"></div>
  </div>
</template>

<script>
export default {
  props: {
    center: {
      type: Boolean,
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .container {
    padding: $unnnic-spacing-stack-xl 12.88%;
    flex: 1;

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
      }
    }
  }

  .footer {
    height: $unnnic-border-width-thick * 2;
    background-color: $unnnic-color-brand-weni;
  }
}
</style>

<template>
  <div v-if="isOpen" :class="['modal', type]" @click.self="close">
    <div class="container">
      <div v-if="type === 'youtube-video'" class="content">
        <div class="aspect-ratio-box">
          <iframe
            class="aspect-ratio-box-inside"
            type="text/html"
            :src="data.url"
            frameborder="0"
            allowfullscreen
          />
        </div>
      </div>

      <template v-else>
        <span></span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
      type: '',
      data: {},
    }
  },

  methods: {
    open(props) {
      this.isOpen = true;

      this.type = props.type;
      this.data = props.data;
    },

    close() {
      this.isOpen = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, $unnnic-opacity-level-overlay);
  display: flex;
  align-items: center;
  padding: 0 12.88%;
  box-sizing: border-box;

  .container {
    flex: 1;
    max-height: 90vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-background-carpet;
    box-shadow: $unnnic-shadow-level-separated;

    .content {
      $scroll-size: $unnnic-inline-nano;

      flex: 1;
      overflow: overlay;

      padding-right: calc(#{$unnnic-inline-xs} + #{$scroll-size});
      width: 100%;

      &::-webkit-scrollbar {
        width: $scroll-size;
      }

      &::-webkit-scrollbar-thumb {
        background: $unnnic-color-neutral-clean;
        border-radius: $unnnic-border-radius-pill;
      }
      
      &::-webkit-scrollbar-track {
        background: $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-pill;
      }
    }
  }

  &.youtube-video {
    .container {
      max-width: 60rem;
      margin: 0 auto;
      padding: 0 $unnnic-inline-md;
      padding-top: $unnnic-spacing-stack-giant;
      padding-bottom: $unnnic-spacing-stack-lg;
    }

    .content {
      .aspect-ratio-box {
        height: 0;
        overflow: hidden;
        padding-top: 9 / 16 * 100%;
        position: relative;
      }

      .aspect-ratio-box-inside {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>

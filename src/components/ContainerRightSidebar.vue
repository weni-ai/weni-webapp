<template>
  <div
    v-if="isOpen"
    class="right-sidebar__side-menu"
    :class="{ closed: isClosed }"
    @click.self="wantToClose"
  >
    <div
      :class="['right-sidebar__side-menu__content', { closed: isClosed }]"
      :style="{ maxWidth }"
    >
      <div v-show="!isLoading" class="right-sidebar__side-menu__content__info">
        <unnnic-icon-svg
          icon="keyboard-arrow-left-1"
          scheme="neutral-darkest"
          clickable
          @click="close"
          :class="{ 'shake-horizontal': shakeCloseButton }"
        ></unnnic-icon-svg>

        <div class="right-sidebar__side-menu__content__info__text">
          <h1>{{ title }}</h1>
          <h2>{{ description }}</h2>
        </div>
      </div>

      <div v-show="!isLoading" class="right-sidebar__side-menu__separator" />

      <slot />

      <skeleton-loading v-show="isLoading" />
    </div>
  </div>
</template>

<script>
import skeletonLoading from '../views/loadings/rightSideBar.vue';

export default {
  model: {
    prop: 'isOpen',
  },

  components: {
    skeletonLoading,
  },

  props: {
    isOpen: {
      type: Boolean,
    },

    type: {
      type: String,
    },

    title: String,
    description: String,

    maxWidth: {
      type: String,
      default: '36.25rem',
    },

    props: {
      type: Object,
    },
  },

  data() {
    return {
      isLoading: false,
      isClosed: true,
      shakeCloseButton: false,
    };
  },

  watch: {
    isOpen: {
      immediate: true,

      handler(value) {
        if (value) {
          setTimeout(() => {
            this.isClosed = false;
          }, 0);
        }

        if (value) {
          window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));
        } else {
          window.dispatchEvent(new CustomEvent('showBottomRightOptions'));
        }
      },
    },
  },

  methods: {
    close() {
      if (this.type === 'manage-members') {
        this.props?.onFinished?.();
      }

      this.isClosed = true;

      setTimeout(() => {
        this.$emit('input', false);
      }, 200);
    },

    wantToClose() {
      this.shakeCloseButton = true;

      setTimeout(() => {
        this.shakeCloseButton = false;
      }, 1000);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.right-sidebar__side-menu {
  position: fixed;
  transition: background-color 0.2s;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;

  &.closed {
    background-color: rgba(0, 0, 0, 0);
  }

  &__separator {
    border-top: 1px solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-sm 0;
  }

  &__component {
    flex: 1;
  }

  &__content {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    box-sizing: border-box;
    transition: right 0.2s;

    width: 100%;

    padding: 32px;
    background-color: white;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;

    &.closed {
      right: -36.25rem;
    }

    h1 {
      margin: 0;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-medium;
    }

    h2 {
      margin: 0;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-medium;
      color: $unnnic-color-neutral-cloudy;
    }

    &__info {
      display: flex;
      &__text {
        flex: 1;
        margin-left: 1rem;
      }
    }
  }
}

.shake-horizontal {
  animation: shake-horizontal 1s cubic-bezier(0.455, 0.03, 0.515, 0.955) both;
}

@keyframes shake-horizontal {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70% {
    transform: translateX(-6px);
  }
  20%,
  40%,
  60% {
    transform: translateX(6px);
  }
  80% {
    transform: translateX(2px);
  }
  90% {
    transform: translateX(-2px);
  }
}
</style>

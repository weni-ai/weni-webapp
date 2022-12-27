<template>
  <div class="dashboard-tutorial-slide">
    <div class="slide" ref="slide">
      <div
        :style="{ width: `${100 * $slots.pages.length}%` }"
        class="pages"
        ref="pages"
        @mouseenter.self="cancelAutoSkip"
        @mouseleave.self="startAutoSkip"
      >
        <slot name="pages" />
      </div>
    </div>

    <div class="controlers">
      <unnnic-icon
        icon="arrow-left-1-1"
        size="sm"
        scheme="neutral-clean"
        clickable
        @click="
          resetAutoSkip();
          previous();
        "
      />

      <div class="pages">
        <div
          v-for="page in $slots.pages.length"
          :key="page"
          :class="['page', { active: currentPage === page - 1 }]"
          @click="
            resetAutoSkip();
            goToSpecificPage(page - 1);
          "
        ></div>
      </div>

      <unnnic-icon
        icon="arrow-right-1-1"
        size="sm"
        scheme="neutral-clean"
        clickable
        @click="
          resetAutoSkip();
          next();
        "
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 0,
      autoSkip: null,
    };
  },

  mounted() {
    this.startAutoSkip();
  },

  methods: {
    scroll(index) {
      this.$refs.slide.scroll({
        top: 0,
        left: (this.$refs.slide.scrollWidth / this.$slots.pages.length) * index,
        behavior: 'smooth',
      });
    },

    next() {
      this.currentPage = (this.currentPage + 1) % this.$slots.pages.length;

      this.scroll(this.currentPage);
    },

    previous() {
      this.currentPage = this.currentPage - 1;

      if (this.currentPage < 0) {
        this.currentPage = this.$slots.pages.length - 1;
      }

      this.scroll(this.currentPage);
    },

    goToSpecificPage(page) {
      this.currentPage = page;

      this.scroll(this.currentPage);
    },

    cancelAutoSkip() {
      clearInterval(this.autoSkip);
    },

    startAutoSkip() {
      this.autoSkip = setInterval(this.next, 7000);
    },

    resetAutoSkip() {
      this.cancelAutoSkip();
      this.startAutoSkip();
    },
  },

  beforeDestroy() {
    this.cancelAutoSkip();
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.dashboard-tutorial-slide {
  .slide {
    width: 100%;
    overflow: hidden;

    .pages {
      display: flex;

      ::v-deep .page {
        flex: 1;

        img {
          width: 100%;
          border-radius: $unnnic-border-radius-sm;
          margin-bottom: $unnnic-spacing-stack-sm;
          aspect-ratio: 629 / 232;
          object-fit: cover;
        }

        .title {
          font-family: $unnnic-font-family-secondary;
          color: $unnnic-color-neutral-dark;
          font-weight: $unnnic-font-weight-bold;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          margin-bottom: $unnnic-spacing-stack-xs;
        }

        .description {
          font-family: $unnnic-font-family-secondary;
          color: $unnnic-color-neutral-dark;
          font-weight: $unnnic-font-weight-regular;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

          a {
            font-family: $unnnic-font-family-secondary;
            color: $unnnic-color-neutral-darkest;
            font-weight: $unnnic-font-weight-regular;
            font-size: $unnnic-font-size-body-gt;
            line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
            text-decoration: underline;
            text-underline-offset: $unnnic-spacing-stack-nano;
            text-decoration-thickness: $unnnic-border-width-thinner;
          }
        }
      }
    }
  }

  .controlers {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $unnnic-spacing-stack-sm;

    .pages {
      margin: 0 $unnnic-spacing-inline-sm;
      display: flex;
      column-gap: $unnnic-spacing-inline-xs;

      .page {
        cursor: pointer;
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 0.25rem;
        background-color: rgba(
          $unnnic-color-neutral-clean,
          $unnnic-opacity-level-overlay
        );
        transition: all 0.5s;

        &.active {
          width: 1rem;
          background-color: $unnnic-color-neutral-clean;
        }
      }
    }
  }
}
</style>

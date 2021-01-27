<template>
    <div
      class="weni-news">
      <div class="weni-news__content">
        <div
          :class="{
            'weni-news__content__text': true,
            'slide-left': animating }"
            @animationend="onFinishAnimating">
          <h2>
            {{ currentInfo.title }} </h2>
          <p> {{ currentInfo.subtitle }} </p>
        </div>
        <div
          class="weni-news__content__text"
          v-show="animating">
          <h2>
            {{ nextInfo.title }} </h2>
          <p> {{ nextInfo.subtitle }} </p>
        </div>
      </div>
      <div class="weni-news__controls">
        <div class="weni-news__indicator__wrapper">
          <div
            v-for="index in total"
            :key="index"
            :class="{'weni-news__indicator': true,
                     'weni-news__indicator--active': current === (animating ? index - 1 : ((index + 1) % total) - 1)}" />
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'News',
  data() {
    return {
      current: 0,
      total: 6,
      slideClass: null,
      nextTimeout: null,
      animating: false,
    };
  },
  mounted() {
    this.resetTimeout();
  },
  computed: {
    hasNext() {
      return this.current < this.total - 1;
    },
    hasPrevious() {
      return this.current > 1;
    },
    currentInfo() {
      return {
        title: this.$t(`home.news.news_${this.current+1}`),
        subtitle: this.$t(`home.news.news_${this.current+1}_subtitle`),
      };
    },
    nextInfo() {
      return {
        title: this.$t(`home.news.news_${((this.current + 1) % this.total)+1}`),
        subtitle: this.$t(`home.news.news_${((this.current + 1) % this.total)+1}_subtitle`),
      }
    }
  },
  watch: {
    current() {
        this.slideClass = 'slide-left';
    }
  },
  methods: {
    onFinishAnimating() {
      this.next();
      this.animating = false;
    },
    resetTimeout() {
      if (this.nextTimeout) {
        clearTimeout(this.nextTimeout);
      }
      this.nextTimeout = setInterval(() => { this.startAnimating(); }, 4 * 1000);
    },
    onSelect(index) {
      this.current = index - 1;
      this.resetTimeout();
    },
    startAnimating() {
      this.animating = true;
    },
    next() {
      this.current = (this.current + 1) % this.total;
    },
  },
};
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnic.scss';


    .slide-left {
      animation: 1s slide-left;
      // margin-left: -100%;
    }

    @keyframes slide-left {
      from {
        margin-left: 0;
      }

      to {
        margin-left: -100%;
      }
    }

    h2 {
      font-weight: $unnic-font-weight-bold;
      font-size: $unnic-font-size-body-md;
    }

    .weni-news {
        padding: $unnic-squish-sm;
        font-family: $unnic-font-family-secondary;
        color: $unnic-color-neutral-dark;
        font-size: $unnic-font-size-body-md;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        &__content {
          flex: 1;
          display: flex;
          overflow: hidden;

          &__text {
            min-width: 100%;
          }
        }

        &__controls {
            margin:1rem 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        &__indicator {
              height: 0.25rem;
              width: 0.25rem;
              border-radius: 50%;
              display: inline-block;
              background-color: $unnic-color-neutral-clean;
            &--active {
                width: 1rem;
                border-radius: 4px;
            }

            &__wrapper {
                margin: 0 0.5rem;
                display: flex;
                justify-content: center;

                > * {
                    margin-right: 0.5rem;
                }

                :last-child {
                    margin: 0;
                }
            }
        }
    }


</style>

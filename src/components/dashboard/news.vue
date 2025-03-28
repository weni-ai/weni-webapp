<template>
  <div class="weni-news">
    <div class="weni-news__content">
      <div
        :class="{
          'weni-news__content__text': true,
          'slide-left': animating,
        }"
        @animationend="onFinishAnimating"
      >
        <h2>
          <RouterLink
            v-if="hrefs[current]"
            :to="hrefs[current]"
          >
            {{ currentInfo.title }}
          </RouterLink>

          <span v-else>{{ currentInfo.title }}</span>
        </h2>

        <p v-html="currentInfo.subtitle" />
      </div>
      <div
        v-show="animating"
        class="weni-news__content__text"
      >
        <h2>
          {{ nextInfo.title }}
        </h2>
        <p v-html="nextInfo.subtitle" />
      </div>
    </div>
    <div class="weni-news__controls">
      <div class="weni-news__indicator__wrapper">
        <div
          v-for="index in total"
          :key="index"
          :class="{
            'weni-news__indicator': true,
            'weni-news__indicator--active':
              (!animating ? current : (current + 1) % total) === index - 1,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { get } from 'lodash';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'News',
  data() {
    return {
      current: 0,
      total: 4,
      slideClass: null,
      nextTimeout: null,
      animating: false,
    };
  },
  mounted() {
    this.resetTimeout();
  },
  computed: {
    ...mapGetters(['currentProject']),

    projectUuid() {
      return get(this.currentProject, 'uuid');
    },

    hrefs() {
      return [
        null,
        `/projects/${this.projectUuid}/push/init`,
        `/projects/${this.projectUuid}/bothub/init`,
      ];
    },

    hasNext() {
      return this.current < this.total - 1;
    },
    hasPrevious() {
      return this.current > 1;
    },
    currentInfo() {
      return {
        title: this.$t(`home.news.news_${this.current + 1}`),
        subtitle: this.$t(`home.news.news_${this.current + 1}_subtitle`),
      };
    },
    nextInfo() {
      const nextIndex = (this.current + 1) % this.total;
      return {
        title: this.$t(`home.news.news_${nextIndex + 1}`),
        subtitle: this.$t(`home.news.news_${nextIndex + 1}_subtitle`),
      };
    },
  },
  watch: {
    current() {
      this.slideClass = 'slide-left';
    },
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
      this.nextTimeout = setInterval(() => {
        this.startAnimating();
      }, 9 * 1000);
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
.slide-left {
  animation: 1s slide-left;
}

@keyframes slide-left {
  from {
    margin-left: 0;
  }

  to {
    margin-left: -100%;
  }
}

a {
  text-decoration: none;
  color: inherit;
}

h2 {
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-md;
  margin: 0 0 $unnnic-spacing-stack-nano 0;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
}

.weni-news {
  padding: $unnnic-squish-xs;
  font-family: $unnnic-font-family-secondary;
  color: $unnnic-color-neutral-dark;
  font-size: $unnnic-font-size-body-md;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
  border-radius: $unnnic-border-radius-sm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100% - 25px);

  p {
    margin: 0;
    // white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: calc(
      2 * (#{$unnnic-font-size-body-md} + #{$unnnic-line-height-medium})
    );
    flex: 1;
  }

  &__content {
    flex: 1;
    display: flex;
    overflow: hidden;

    &__text {
      min-width: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  &__controls {
    margin: 12px 2rem 0 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__indicator {
    height: 0.25rem;
    width: 0.25rem;
    border-radius: 50%;
    display: inline-block;
    background-color: $unnnic-color-neutral-clean;
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

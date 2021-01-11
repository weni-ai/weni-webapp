<template>
    <div
      class="weni-news">
      <div :class="slideClass">
        <h2 
          :class="{'unnic--clickable': info[current].action}" 
          @click="info[current].action"> 
          {{ $t(`home.news.${info[current].title}`) }} </h2>
        <p> {{ $t(`home.news.${info[current].description}`) }} </p>
      </div>
      <div class="weni-news__controls">
        <div class="weni-news__indicator__wrapper">
          <div
            v-for="index in info.length"
            :key="index"
            :class="{'weni-news__indicator': true,
                     'weni-news__indicator--active': current === index - 1}"
            @click="onSelect(index)" />
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
      info: [
        {title: 'news_1', description: 'news_1_subtitle', action: null},
        {title: 'news_2', description: 'news_2_subtitle', action: () => { this.navigateTo('push')}},
        {title: 'news_3', description: 'news_3_subtitle', action: () => { this.navigateTo('bothub')}},
        {title: 'news_4', description: 'news_4_subtitle', action: () => { this.navigateTo('rocketchat')}},
      ],
      slideClass: null,
      nextTimeout: null,
    };
  },
  mounted() {
    this.resetTimeout();
  },
  computed: {
    hasNext() {
      return this.current < this.info.count;
    },
    hasPrevious() {
      return this.current > 1;
    },
  },
  watch: {
    current() {
        this.slideClass = 'slide-left';
    }
  },
  methods: {
    resetTimeout() {
      if (this.nextTimeout) {
        clearTimeout(this.nextTimeout);
      }
      this.nextTimeout = setInterval(() => { this.next(); }, 4 * 1000);
    },
    onSelect(index) {
      this.current = index - 1;
      this.resetTimeout();
    },
    navigateTo(node) {
      this.luigiClient.linkManager().withoutSync().navigate(`/dashboard/${node}`);
    },
    next() {
      this.current = (this.current + 1) % this.info.length;
    },
  },
};
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnic.scss';

    h2 {
      font-weight: $unnic-font-weight-bold;
    }

    .weni-news {
        padding: $unnic-squish-sm;
        font-family: $unnic-font-family-secondary;
        color: $unnic-color-neutral-dark;
        font-size: $unnic-font-size-body-md;

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
              cursor: pointer;
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

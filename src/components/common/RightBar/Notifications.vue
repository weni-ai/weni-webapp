<template>
  <div class="news-container">
    <template v-for="(info, index) in $store.state.News.all">
      <div :key="info.id" class="news">
        <div
          :class="[
            'unnnic-font secondary body-lg',
            info.id > lastViewedNews
              ? 'color-neutral-darkest'
              : 'color-neutral-cloudy',
            { bold: info.id > lastViewedNews },
          ]"
        >
          {{ info.title }}
          {{ info.id }}
        </div>

        <div
          :class="[
            'unnnic-font secondary body-gt',
            info.id > lastViewedNews
              ? 'color-neutral-darkest'
              : 'color-neutral-cloudy',
            { bold: info.id > lastViewedNews },
          ]"
        >
          {{ info.description }}
        </div>
      </div>

      <div
        v-if="index !== $store.state.News.all.length - 1"
        :key="`separator-${info.id}`"
        class="separator"
      ></div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    orgUuid: String,
  },

  data() {},

  computed: {
    lastViewedNews() {
      return this.$store.state.News.lastViewedNews;
    },
  },

  created() {
    const max = Math.max.apply(
      null,
      this.$store.state.News.all.map(({ id }) => id),
    );

    localStorage.setItem('lastViewedNews', max || 0);
  },

  beforeDestroy() {
    const max = Math.max.apply(
      null,
      this.$store.state.News.all.map(({ id }) => id),
    );

    this.$store.state.News.lastViewedNews = max || 0;
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.news-container {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-md;

  .news {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-stack-xs;
  }

  .separator {
    height: $unnnic-border-width-thinner;
    width: 100%;
    background-color: $unnnic-color-neutral-soft;
  }
}
</style>

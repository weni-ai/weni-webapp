<template>
  <div class="news-container">
    <template v-for="(info, index) in news">
      <div :key="info.id" class="news">
        <div class="unnnic-font secondary body-lg bold color-neutral-darkest">
          {{ info.title }}
        </div>

        <div class="unnnic-font secondary body-gt bold color-neutral-darkest">
          {{ info.description }}
        </div>
      </div>

      <div
        v-if="index !== news.length - 1"
        :key="`separator-${info.id}`"
        class="separator"
      ></div>
    </template>
  </div>
</template>

<script>
import dashboard from '../../../api/dashboard';

export default {
  props: {
    orgUuid: String,
  },

  data() {
    return {
      news: [],
    };
  },

  created() {
    dashboard.newsletterList(this.orgUuid, 0, 20).then((response) => {
      this.news = response.data.results;
    });
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

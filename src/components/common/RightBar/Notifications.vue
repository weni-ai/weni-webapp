<template>
  <div class="news-container">
    <template v-for="(info, index) in $store.state.News.all">
      <div
        v-if="['trial-about-to-end', 'trial-ended'].includes(info.title)"
        :key="info.id"
        class="news organization"
      >
        <div
          :class="[
            'title unnnic-font secondary body-lg',
            isNewNews(info) ? 'color-neutral-darkest' : 'color-neutral-cloudy',
            { bold: isNewNews(info) },
          ]"
        >
          <unnnic-avatar-icon
            enabled
            icon="hierarchy-3-2"
            size="xs"
            scheme="aux-blue"
          />

          {{
            $t(`billing.modals.${info.title}.title`, {
              name: info.organization_name,
            })
          }}
        </div>

        <div
          :class="[
            'unnnic-font secondary body-gt',
            isNewNews(info) ? 'color-neutral-darkest' : 'color-neutral-cloudy',
            { bold: isNewNews(info) },
          ]"
        >
          {{
            $t(`billing.modals.${info.title}.description`, {
              name: info.organization_name,
              date: date(info.trial_end_date),
            })
          }}

          <router-link
            :to="{
              name: 'BillingPlans',
              params: {
                orgUuid: info.organization,
              },
            }"
            v-slot="{ href, navigate }"
          >
            <a
              :href="href"
              @click="click($event, navigate)"
              class="u color-neutral-cloudy"
            >
              {{ $t('billing.modals.common.make_an_upgrade') }}
            </a>
          </router-link>
        </div>
      </div>

      <div v-else :key="info.id" class="news">
        <div
          :class="[
            'unnnic-font secondary body-lg',
            isNewNews(info) ? 'color-neutral-darkest' : 'color-neutral-cloudy',
            { bold: isNewNews(info) },
          ]"
        >
          {{ info.title }}
        </div>

        <div
          :class="[
            'unnnic-font secondary body-gt',
            isNewNews(info) ? 'color-neutral-darkest' : 'color-neutral-cloudy',
            { bold: isNewNews(info) },
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
import moment from 'moment';

export default {
  props: {
    orgUuid: String,
  },

  data() {
    return {};
  },

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

  methods: {
    isNewNews({ id }) {
      return id > this.lastViewedNews;
    },

    click($event, navigate) {
      this.$store.state.BillingSteps.flow = 'change-plan';
      navigate($event);

      this.$emit('close');
    },

    date(date) {
      if (!date) {
        return;
      }

      moment.locale(this.$i18n.locale);
      return moment(date).fromNow();
    },
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

    &.organization {
      .title {
        display: flex;
        align-items: center;
        column-gap: $unnnic-spacing-inline-xs;
      }

      a {
        text-underline-offset: $unnnic-spacing-stack-nano;
      }
    }
  }

  .separator {
    height: $unnnic-border-width-thinner;
    width: 100%;
    background-color: $unnnic-color-neutral-soft;
  }
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="news-container">
    <UnnnicTab
      :activeTab="tab"
      :tabs="['updates', isProjectSelected ? 'recent-activities' : null]"
      @change="tab = $event"
    >
      <template #tab-head-updates>
        {{ $t('news.tabs.updates') }}
      </template>

      <template #tab-panel-updates>
        <NotificationsUpdates />
      </template>

      <template #tab-head-recent-activities>
        {{ $t('news.tabs.recent_activities') }}
      </template>
    </UnnnicTab>

    <section
      v-show="tab === 'recent-activities'"
      class="recent-activities"
    >
      <section
        v-for="(activity, index) in recentActivities.data"
        :key="index"
        class="recent-activity"
      >
        <span
          v-html="
            $t(
              `home.quick_access.lastest_activities.actions.${activity.action}`,
              activity,
            )
          "
        ></span>

        <span class="date">
          {{ fromNow(activity.created_at) }}
        </span>
      </section>

      <section v-show="['loading', null].includes(recentActivities.status)">
        <section
          v-for="i in 4"
          :key="`recent-activity-loading-${i}`"
          ref="recent-activities-loading"
          class="recent-activity"
        >
          <UnnnicSkeletonLoading
            tag="span"
            height="22px"
            width="190px"
          />
          <UnnnicSkeletonLoading
            tag="span"
            height="22px"
            width="45px"
          />
        </section>
      </section>
    </section>
  </section>
</template>

<script>
import moment from 'moment';
import 'moment/dist/locale/pt-br';
import 'moment/dist/locale/es';
import NotificationsUpdates from './NotificationsUpdates.vue';

export default {
  components: {
    NotificationsUpdates,
  },

  props: {},

  data() {
    return {
      tab: 'updates',

      isInfiniteLoadingElementShowed: false,
      intersectionObserver: null,
    };
  },

  computed: {
    projectSelected() {
      return this.$route.params?.projectUuid;
    },

    isProjectSelected() {
      return !!this.projectSelected;
    },

    recentActivities() {
      return (
        this.$store.state.Project.recentActivities[this.projectSelected] || {
          status: 'empty',
          data: [],
        }
      );
    },
  },

  watch: {
    isInfiniteLoadingElementShowed: {
      immediate: true,

      handler() {
        if (
          this.projectSelected &&
          this.recentActivities.status === null &&
          this.isInfiniteLoadingElementShowed
        ) {
          this.$store.dispatch('getRecentActivities', this.projectSelected);
        }
      },
    },
  },

  mounted() {
    this.$store.dispatch('getRecentActivities', this.projectSelected);

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isInfiniteLoadingElementShowed = entry.isIntersecting;
      });
    });

    const recentActivitiesLoading = this.$refs['recent-activities-loading'];

    if (recentActivitiesLoading) {
      this.intersectionObserver.observe(recentActivitiesLoading.at(0));
    }
  },

  beforeUnmount() {
    const recentActivitiesLoading = this.$refs['recent-activities-loading'];

    if (recentActivitiesLoading) {
      this.intersectionObserver.unobserve(recentActivitiesLoading.at(0));
    }
  },

  methods: {
    fromNow(date) {
      return moment(date).locale(this.$i18n.locale).fromNow();
    },
  },
};
</script>

<style lang="scss" scoped>
.recent-activities {
  margin-top: $unnnic-spacing-md;

  .recent-activity {
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: $unnnic-spacing-xs;

    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    :deep(.hightlight) {
      color: $unnnic-color-weni-700;
      font-weight: $unnnic-font-weight-bold;
    }

    .date {
      color: $unnnic-color-neutral-cloudy;
      white-space: nowrap;
    }

    & + .recent-activity {
      margin-top: $unnnic-spacing-ant;
    }
  }
}
</style>

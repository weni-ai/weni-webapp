<template>
  <div class="weni-home">
    <div v-show="!loading" class="weni-home__content unnnic-grid-giant">
      <div
        :class="[
          'weni-home__welcome',
          {
            template: getStartedPage,
          },
        ]"
      >
        <emote class="weni-home__welcome__emote" />
        <div>
          <p class="weni-home__welcome__title">
            {{
              $t('home.welcome', {
                project: projectName,
                user: profileFirstName,
              })
            }}
          </p>
          <p
            v-show="$i18n.locale === 'en'"
            class="weni-home__welcome__subtitle"
            v-html="
              $t('home.time', {
                time: addMark(date.time),
                day: addMark(date.date),
              })
            "
          />
          <p
            v-show="$i18n.locale !== 'en'"
            class="weni-home__welcome__subtitle"
            v-html="
              $t('home.time', {
                hour: addMark(date.hour),
                minutes: addMark(date.minutes),
                day: addMark(date.date),
              })
            "
          />
        </div>
      </div>

      <news v-if="getStartedPage" class="weni-home__info" />

      <project-home-blank-champion-chatbot v-else class="champion-chatbot" />

      <template v-if="getStartedPage">
        <unnnic-card
          class="unnnic-grid-span-8 get-started-title"
          type="title"
          info-position="left"
          :title="$t('home.started.title')"
          scheme="aux-purple"
          :info="$t('home.started.info')"
        />

        <unnnic-card
          class="unnnic-grid-span-4"
          type="title"
          icon="task-list-clock-1"
          :title="$t('home.newsletter')"
          scheme="aux-orange"
          info-position="left"
          :info="$t('home.newsletter_info')"
        />
      </template>

      <template v-if="getStartedPage">
        <div class="unnnic-grid-span-8 dashboard-tutorial-slide-container">
          <dashboard-tutorial-slide />
        </div>
      </template>

      <template v-else>
        <div
          class="unnnic-grid-span-6"
          :style="{
            display: 'flex',
            minHeight: '100%',
            flexDirection: 'column',
            rowGap: '24px',
          }"
        >
          <unnnic-card
            type="title"
            info-position="bottom"
            :title="$t('home.started.title')"
            scheme="aux-purple"
            :info="$t('home.started.info')"
            icon="check-circle-1-1"
          />

          <div class="dashboard-tutorial-slide-container" :style="{ flex: 1 }">
            <dashboard-tutorial-blank-slide />
          </div>
        </div>

        <project-home-blank-quick-access />
      </template>

      <newsletter
        v-if="projectUuid && getStartedPage"
        @loadingNews="getLoadingNews"
        class="unnnic-grid-span-4"
      />
    </div>
    <div v-show="loading">
      <skeleton-loading />
    </div>
  </div>
</template>

<script>
import Emote from '../components/Emote.vue';
import Newsletter from '../components/dashboard/newsletter.vue';
import News from '../components/dashboard/news.vue';
import SkeletonLoading from './loadings/dashboard';
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';
import DashboardTutorialSlide from '../components/DashboardTutorialSlide.vue';
import DashboardTutorialBlankSlide from '../components/DashboardTutorialBlankSlide.vue';
import ProjectHomeBlankQuickAccess from './ProjectHomeBlank/QuickAccess.vue';
import ProjectHomeBlankChampionChatbot from './ProjectHomeBlank/ChampionChatbot.vue';
import getEnv from '../utils/env';
import { PROJECT_ROLE_VIEWER } from '../components/users/permissionsObjects';

export default {
  name: 'Home',
  components: {
    Emote,
    Newsletter,
    News,
    SkeletonLoading,
    DashboardTutorialSlide,
    DashboardTutorialBlankSlide,
    ProjectHomeBlankQuickAccess,
    ProjectHomeBlankChampionChatbot,
  },

  data() {
    return {
      date: { date: '', time: '', hour: '', minutes: '' },
      loadingStatus: false,
      loadingNews: false,
    };
  },
  computed: {
    ...mapState({
      profile: (state) => state.Account.profile,
    }),

    ...mapGetters(['currentProject']),

    getStartedPage() {
      return (
        this.$route.name === 'home' &&
        this.currentProject.project_type === 'template'
      );
    },

    loading() {
      return this.loadingProject || this.loadingStatus || this.loadingNews;
    },

    projectUuid() {
      return get(this.currentProject, 'uuid');
    },

    projectName() {
      return get(this.currentProject, 'name');
    },

    profileFirstName() {
      return get(this.profile, 'first_name');
    },
  },
  watch: {
    '$i18n.locale'() {
      this.getDate();
    },

    '$route.params.projectUuid': {
      immediate: true,
      handler() {
        if (
          !this.$store.getters.currentProject.menu.chat.length &&
          getEnv('MODULE_CHATS') &&
          this.$store.getters.currentProject.authorization.chats_role.role ===
            2 &&
          this.$store.getters.currentProject.authorization.role ===
            PROJECT_ROLE_VIEWER
        ) {
          this.$router.replace({
            name: 'chats',
            params: {
              projectUuid: this.$store.getters.currentProject.uuid,
              internal: ['init'],
            },
          });
        }
      },
    },
  },

  mounted() {
    this.getDate();
    setInterval(() => {
      this.getDate();
    }, 60 * 1000);
  },
  methods: {
    getDate() {
      const date = new Date();

      if (this.$i18n.locale === 'pt-br') {
        this.date.date = date.toLocaleString(this.$i18n.locale, {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        });
        this.date.hour = date.toLocaleString(this.$i18n.locale, {
          hour: 'numeric',
        });
        this.date.hour += 'h';
        this.date.minutes = date.toLocaleString(this.$i18n.locale, {
          minute: 'numeric',
        });
        return;
      }
      this.date.date = date.toLocaleString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
      this.date.time = date.toLocaleTimeString(this.$i18n.locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    addMark(text) {
      return `<span class="weni-home__welcome__subtitle--token">${text}</span>`;
    },
    getLoadingStatus(payload) {
      this.loadingStatus = payload;
    },
    getLoadingNews(payload) {
      this.loadingNews = payload;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.get-started-title ::v-deep .unnnic-tooltip-label {
  max-width: 12rem;
}

.dashboard-tutorial-slide-container {
  padding: $unnnic-spacing-inset-md $unnnic-spacing-inline-xl;
  padding-bottom: $unnnic-spacing-stack-sm;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-sm;
  box-shadow: $unnnic-shadow-level-separated;
}
</style>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-home {
  background-color: $unnnic-color-background-snow;
  width: 100%;
  box-sizing: border-box;
  padding-top: $unnnic-spacing-stack-md;
  padding-bottom: $unnnic-spacing-stack-md;

  &__content {
    height: fit-content;
    min-height: 100%;
    align-items: flex-start;
    grid-template-rows: max-content;
  }

  &__info {
    background-color: $unnnic-color-neutral-lightest;
    grid-column: span 4;

    @media only screen and (max-width: 1040px) {
      grid-column: span 12;
    }
  }

  .champion-chatbot {
    grid-column: span 6;

    @media only screen and (max-width: 1040px) {
      grid-column: span 12;
    }
  }

  &__welcome {
    padding: $unnnic-inset-md;
    background-color: $unnnic-color-neutral-lightest;
    border-radius: $unnnic-border-radius-md;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    grid-column: span 6;

    &.template {
      grid-column: span 8;
    }

    @media only screen and (max-width: 1040px) {
      &,
      &.template {
        grid-column: span 12;
      }
    }

    &__emote {
      margin-right: $unnnic-inline-sm;
    }

    &__title {
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-medium;
      font-weight: $unnnic-font-weight-regular;
      margin: 0 0 $unnnic-spacing-stack-nano 0;
    }

    &__subtitle {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
      font-weight: $unnnic-font-weight-regular;
      margin: 0;

      &--token {
        color: $unnnic-color-brand-weni-soft;
        font-weight: $unnnic-font-weight-bold;
      }
    }
  }
}
</style>

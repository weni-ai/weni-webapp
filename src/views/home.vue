<template>
  <div class="weni-home">
    <div v-show="!loading" class="weni-home__content unnnic-grid-giant">
      <chats-invitation
        v-if="hasRocketChat"
        class="weni-home__welcome"
      ></chats-invitation>
      <flow-editor-invitation v-else class="weni-home__welcome" />

      <project-home-blank-champion-chatbot class="champion-chatbot" />

      <template>
        <div
          :class="[
            'get-started',
            { 'has-not-chats-banner': !hasRocketChat && !hasflowEditorBanner },
          ]"
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
            icon="check_circle"
          />

          <div class="dashboard-tutorial-slide-container" :style="{ flex: 1 }">
            <dashboard-tutorial-slide v-if="getStartedPage" />
            <dashboard-tutorial-blank-slide v-else />
          </div>
        </div>

        <project-home-blank-quick-access class="quick-access" />
      </template>
    </div>
    <div v-show="loading">
      <skeleton-loading />
    </div>
  </div>
</template>

<script>
import SkeletonLoading from './loadings/dashboard';
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';
import DashboardTutorialSlide from '../components/DashboardTutorialSlide.vue';
import DashboardTutorialBlankSlide from '../components/DashboardTutorialBlankSlide.vue';
import ProjectHomeBlankQuickAccess from './ProjectHomeBlank/QuickAccess.vue';
import ProjectHomeBlankChampionChatbot from './ProjectHomeBlank/ChampionChatbot.vue';
import getEnv from '../utils/env';
import { PROJECT_ROLE_CHATUSER } from '../components/users/permissionsObjects';
import ChatsInvitation from '../components/banners/ChatsInvitation.vue';
import FlowEditorInvitation from '../components/banners/FlowEditorInvitation.vue';

export default {
  name: 'Home',
  components: {
    SkeletonLoading,
    DashboardTutorialSlide,
    DashboardTutorialBlankSlide,
    ProjectHomeBlankQuickAccess,
    ProjectHomeBlankChampionChatbot,
    ChatsInvitation,
    FlowEditorInvitation,
  },

  data() {
    return {
      date: { date: '', time: '', hour: '', minutes: '' },
      loadingStatus: false,
      loadingNews: false,
      hasflowEditorBanner: true,
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
        this.currentProject.project_type?.startsWith?.('template')
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

    hasRocketChat() {
      // temporary for testing purposes
      if (this.$route.query.hasRocketChat === 'true') {
        return true;
      }

      return get(this.$store.getters.currentProject, 'menu.chat.length');
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
          getEnv('MODULES_YAML').chats &&
          this.$store.getters.currentProject.authorization.role ===
            PROJECT_ROLE_CHATUSER
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

.weni-home {
  background-color: $unnnic-color-background-snow;
  width: 100%;
  box-sizing: border-box;
  padding-top: $unnnic-spacing-stack-md;
  padding-bottom: $unnnic-spacing-stack-md;
}

.get-started-title ::v-deep .unnnic-tooltip-label {
  max-width: 12rem;
}

.dashboard-tutorial-slide-container {
  padding: $unnnic-spacing-inset-md $unnnic-spacing-inline-xl;
  padding-bottom: 5.5rem;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-sm;
  box-shadow: $unnnic-shadow-level-separated;
}

.weni-home__content {
  grid-template-rows: max-content;
  grid-template-rows: auto;

  .chats-invitation,
  .floweditor-invitation {
    grid-area: 1 / 1 / 2 / 7;
  }

  .champion-chatbot {
    grid-area: 1 / 7 / 2 / 13;
  }

  .get-started {
    grid-area: 2 / 1 / 3 / 7;
  }

  .get-started.has-not-chats-banner {
    grid-row-start: 1;
  }

  .quick-access {
    grid-area: 2 / 7 / 3 / 13;
  }

  @media only screen and (max-width: 1024px) {
    .chats-invitation,
    .floweditor-invitation,
    .champion-chatbot,
    .get-started,
    .get-started.has-not-chats-banner,
    .quick-access {
      grid-column-start: 1;
      grid-column-end: 13;
      grid-row-start: auto;
      grid-row-end: auto;
    }
  }
}
</style>

<template>
  <div
    v-if="!isCommerceProject"
    class="weni-home"
  >
    <div
      v-show="!loading"
      class="weni-home__content unnnic-grid-giant"
    >
      <FlowEditorInvitation class="weni-home__welcome" />

      <ProjectHomeBlankChampionChatbot class="champion-chatbot" />

      <div
        :class="['get-started']"
        :style="{
          display: 'flex',
          minHeight: '100%',
          flexDirection: 'column',
          rowGap: '24px',
        }"
      >
        <BrainGreetings />
      </div>

      <ProjectHomeBlankQuickAccess class="quick-access" />
    </div>
    <div v-show="loading">
      <SkeletonLoading />
    </div>
  </div>

  <div
    v-else
    class="weni-new-platform"
  >
    <RemoteComponents
      :auth="{
        token: $keycloak.token,
        uuid: $store.getters.currentProject.uuid,
      }"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';
import getEnv from '../utils/env';
import { PROJECT_ROLE_CHATUSER } from '../components/users/permissionsObjects';
import RemoteComponents from '../components/RemoteComponents.vue';
import { PROJECT_COMMERCE } from '../utils/constants';
import SkeletonLoading from './loadings/dashboard.vue';
import ProjectHomeBlankQuickAccess from './ProjectHomeBlank/QuickAccess.vue';
import ProjectHomeBlankChampionChatbot from './ProjectHomeBlank/ChampionChatbot.vue';
import FlowEditorInvitation from '../components/banners/FlowEditorInvitation.vue';
import BrainGreetings from '../components/BrainGreetings.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  components: {
    RemoteComponents,
    SkeletonLoading,
    ProjectHomeBlankQuickAccess,
    ProjectHomeBlankChampionChatbot,
    FlowEditorInvitation,
    BrainGreetings,
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
        this.currentProject.template_type?.startsWith?.('template')
      );
    },

    loading() {
      return this.loadingStatus || this.loadingNews;
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

    isCommerceProject() {
      const featureFlagsStore = useFeatureFlagsStore();
      return this.currentProject.project_mode === PROJECT_COMMERCE && featureFlagsStore.flags.newConnectPlataform;
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

      if (this.$i18n?.locale === 'pt-br') {
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
      this.date.date = date.toLocaleString(this.$i18n?.locale, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
      this.date.time = date.toLocaleTimeString(this.$i18n?.locale, {
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
.weni-home {
  background-color: $unnnic-color-background-snow;
  width: 100%;
  box-sizing: border-box;
  padding-top: $unnnic-spacing-stack-md;
  padding-bottom: $unnnic-spacing-stack-md;
}

.get-started-title :deep(.unnnic-tooltip-label) {
  max-width: 12rem;
}

.weni-home__content {
  grid-template-rows: max-content;
  grid-template-rows: auto;

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

.weni-new-platform {
  background-color: $unnnic-color-background-snow;
  width: 100%;
  box-sizing: border-box;
  padding: $unnnic-spacing-lg $unnnic-spacing-sm $unnnic-spacing-nano
    $unnnic-spacing-sm;
  gap: $unnnic-spacing-lg;
}
</style>

<template>
  <div
    v-if="!isCommerceProject"
    class="weni-home"
  >
    <div class="discover">
      <div class="discover-title">
        <p class="discover-title-main">Discover smarter service through multi-agent colaboration</p>
        <p class="discove-title-description">At Agent Builder 2.0, multi-agent colaboration redefines customer service. Each agent steps in at the right time, with the right expertise, delivering a smooth, fast, and highly personalized experience.</p>
        <UnnnicButton
          class="discover-title-button"
          variant="primary"
          size="small"
        >
          Discover
        </UnnnicButton>
      </div>
      <div class="discover-chart">
        <img src="../assets/discover-chart.png" alt="Discover chart">
      </div>
    </div>
    <div
      v-show="!loading"
    class="weni-home__content unnnic-grid-giant"
    >
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
import { useFeatureFlagsStore } from '@/store/featureFlags';

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

.discover {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  padding: $unnnic-spacing-stack-md;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);
}

.discover-title {
  grid-column: span 3; 
  display: flex;
  flex-direction: column;
  padding: $unnnic-spacing-stack-md;
  gap: $unnnic-spacing-stack-md;
  background: $unnnic-color-weni-50;
}

.discover-title-main {
  font-size: $unnnic-font-size-title-md;
  font-weight: $unnnic-font-weight-bold;
  font-family: $unnnic-font-family-primary;
  color: $unnnic-color-neutral-darkest;
}

.discover-title-description {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-lg;
  color: $unnnic-color-neutral-dark;
}


.discover-chart {
  grid-column: span 9; 
  display: flex;
  align-items: center;
  justify-content: center;
}


.full-width-container {
  padding: 0;
  margin: 0;
  display: block;
}

.get-started-title :deep(.unnnic-tooltip-label) {
  max-width: 12rem;
}

.weni-home__content {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;

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
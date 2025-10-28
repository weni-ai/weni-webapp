<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="!isCommerceProject"
    class="weni-home"
  >
    <div class="discover">
      <div class="discover-title">
        <p class="discover-title-main">{{ $t('header.title') }}</p>
        <p
          class="discover-title-description"
          v-html="$t('header.description')"
        ></p>
        <div class="discover-title-button">
          <UnnnicButton
            class="discover-title-button"
            variant="primary"
            size="small"
            @click="redirectToAgentBuilder2Docs"
          >
            {{ $t('header.button') }}
          </UnnnicButton>
        </div>
      </div>
      <div class="discover-chart">
        <img
          class="discover-chart__image"
          src="../assets/discover-chart.gif"
          alt="Discover chart"
        />
      </div>
    </div>
    <div
      v-show="!loading"
      class="weni-home__content"
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
import { useFeatureFlagsStore } from '@/store/featureFlags';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  components: {
    RemoteComponents,
    SkeletonLoading,
    ProjectHomeBlankQuickAccess,
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

    isOrgTrialPlan() {
      return (
        this.$store.state.Org.currentOrg.organization_billing.plan === 'trial'
      );
    },

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
      return (
        this.currentProject.project_mode === PROJECT_COMMERCE &&
        featureFlagsStore.flags.newConnectPlataform
      );
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
    redirectToAgentBuilder2Docs() {
      const docsLanguageMap = {
        'pt-br': 'pt',
        en: 'en',
        es: 'es',
      };
      const docsLanguage = docsLanguageMap[this.$i18n.locale];
      window.open(
        `https://help.vtex.com/${docsLanguage}/tutorial/visao-geral-agent-builder--6t9oYS7E2AJH9c2AYReUrs`,
        '_blank',
      );
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
  margin: $unnnic-spacing-md;
  box-shadow: $unnnic-shadow-level-separated;
}

.discover-title {
  grid-column: span 5;
  display: flex;
  flex-direction: column;
  padding: $unnnic-spacing-md;
  background: $unnnic-color-weni-50;
  line-height: 2rem;
}

.discover-title-main {
  font-size: $unnnic-font-size-title-md;
  font-weight: $unnnic-font-weight-bold;
  font-family: $unnnic-font-family-primary;
  color: $unnnic-color-neutral-darkest;
  margin: 0 !important;
  padding-bottom: $unnnic-spacing-xs;
  padding-top: $unnnic-spacing-md;
}

.discover-title-description {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-lg;
  color: $unnnic-color-neutral-dark;
  line-height: 1.5rem;
  margin: 0 !important;
  padding-bottom: $unnnic-spacing-md;
}

.discover-title-button {
  display: flex;
  width: 100%;
  padding-bottom: $unnnic-spacing-md;
}

.discover-chart {
  grid-column: span 7;
  display: flex;
  align-items: center;
  justify-content: center;

  &__image {
    max-width: 100%;
  }
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
  display: flex;
  padding: 0 $unnnic-spacing-md;
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

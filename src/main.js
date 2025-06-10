import { createApp } from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import vueDebounce from 'vue-debounce';
import { createPinia } from 'pinia';
import Keycloak from './services/Keycloak';
import UnnnicSystem from './utils/plugins/UnnnicSystem';
import getEnv from '@/utils/env';
import { initializeGrowthBook, gbKey } from '@/utils/growthbook';
import '@weni/unnnic-system/dist/style.css';

function getOriginFromURL(url) {
  return new URL(url).origin;
}

initializeGrowthBook().then((gbInstance) => {

  if ('ontouchstart' in window && screen.width < 1024) {
    const Chats = new URL(getOriginFromURL(getEnv('MODULES_YAML').chats));
  
    Chats.searchParams.append(
      'redirect',
      window.location.href.replace(window.location.origin + '/', ''),
    );
  
    window.location = Chats.href;
  }
  
  const app = createApp(App);
  
  app.use(Keycloak.plugin);
  
  app.use(vueDebounce, {
    listenTo: 'input',
  });
  
  if (getEnv('SENTRY_DSN_ENDPOINT')) {
    Sentry.init({
      dsn: getEnv('SENTRY_DSN_ENDPOINT'),
      integrations: [new VueIntegration({ app, attachProps: true })],
      environment: getEnv('SENTRY_ENVIRONMENT'),
      logErrors: true,
    });
  }
  
  app.mixin({
    data() {
      return {
        rules: {
          email: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
          contact: /\+\d{2}\s\(\d{2}\)\s\d\s\d{4}-?\d{4}/,
        },
      };
    },
  
    computed: {
      theme() {
        const name = this.$route.name;
  
        if (!name) {
          return '';
        }
  
        const themes = {
          help: () => 'secondary',
          academy: () => 'secondary',
          apiFlows: () => 'secondary',
          apiIntelligence: () => 'secondary',
          create_org: () => 'expand',
          project_create: () => 'expand',
          apiNexus: () => 'secondary',
          orgs: () => 'secondary',
          OrgsRequired: () => 'secondary',
          billing: () => 'secondary',
          BillingPlans: () => 'secondary',
          projects: () => 'secondary',
          privacy_policy: () => 'expand',
          account: ({ org, project }) => {
            if (org && project) return 'normal';
            return 'secondary';
          },
          account2fa: ({ org, project }) => {
            if (org && project) return 'normal';
            return 'secondary';
          },
          accountPreferences: ({ org, project }) => {
            if (org && project) return 'normal';
            return 'secondary';
          },
          AccountConfirm: () => 'secondary',
          OrganizationRequireTwoFactor: () => {
            return 'secondary';
          },
          not_found: () => 'expand',
        };
  
        return themes[name]
          ? themes[name]({
              org: store.getters.currentOrg,
              project: store.getters.currentProject,
            })
          : 'normal';
      },
    },
  });
  
  app.use(router);
  app.use(store);
  app.use(createPinia());
  app.use(i18n);
  app.use(UnnnicSystem);

  app.provide(gbKey, gbInstance);

  app.mount('#app');
});
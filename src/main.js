import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';
import { StripePlugin } from '@vue-stripe/vue-stripe';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import vueDebounce from 'vue-debounce';
import VueQRCodeComponent from 'vue-qrcode-component';
import Keycloak from './services/Keycloak';
import UnnnicSystem from './utils/plugins/UnnnicSystem';
import './utils/plugins/Hotjar.js';

import getEnv from '@/utils/env';

function getOriginFromURL(url) {
  return new URL(url).origin;
}

if ('ontouchstart' in window && screen.width < 1024) {
  const Chats = new URL(getOriginFromURL(getEnv('MODULES_YAML').chats));

  Chats.searchParams.append(
    'redirect',
    window.location.href.replace(window.location.origin + '/', ''),
  );

  window.location = Chats.href;
}

Vue.use(Keycloak.plugin);

Vue.config.productionTip = false;
Vue.use(vueDebounce, {
  listenTo: 'input',
});

Vue.component('qr-code', VueQRCodeComponent);

if (getEnv('VUE_APP_SENTRY_DSN_ENDPOINT')) {
  Sentry.init({
    dsn: getEnv('VUE_APP_SENTRY_DSN_ENDPOINT'),
    integrations: [new VueIntegration({ Vue, attachProps: true })],
    environment: process.env.NODE_ENV,
    logErrors: true,
  });
}

Vue.mixin({
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
        academy: () => 'secondary',
        apiFlows: () => 'secondary',
        apiIntelligence: () => 'secondary',
        apiNexus: () => 'secondary',
        create_org: () => 'secondary',
        orgs: () => 'secondary',
        OrgsRequired: () => 'secondary',
        billing: () => 'secondary',
        BillingPlans: () => 'secondary',
        projects: () => 'secondary',
        project_create: () => 'secondary',
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

const stripeOptions = {
  pk: getEnv('VUE_APP_STRIPE_API'),
};

Vue.use(StripePlugin, stripeOptions);

Vue.use(UnnnicSystem);

export default new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');

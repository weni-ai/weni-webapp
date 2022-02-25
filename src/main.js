import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';
import { StripePlugin } from '@vue-stripe/vue-stripe';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import vueDebounce from 'vue-debounce';
import Keycloak from './services/Keycloak';

Vue.use(Keycloak.plugin);

Vue.config.productionTip = false;
Vue.use(vueDebounce, {
  listenTo: 'input',
});

if (process.env.VUE_APP_SENTRY_DSN_ENDPOINT) {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN_ENDPOINT,
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
        create_org: () => 'secondary',
        orgs: () => 'secondary',
        billing: () => 'secondary',
        BillingPlans: () => 'secondary',
        projects: () => 'secondary',
        project_create: () => 'secondary',
        privacy_policy: () => 'expand',
        account: ({ org, project }) => {
          if (org && project) return 'normal';
          return 'secondary';
        },
        AccountConfirm: () => 'secondary',
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
  pk: process.env.VUE_APP_STRIPE_API,
};

Vue.use(StripePlugin, stripeOptions);

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');

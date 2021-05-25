import Vue from 'vue';
import * as Sentry from '@sentry/vue';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import vueDebounce from 'vue-debounce';

Vue.config.productionTip = false;
Vue.use(vueDebounce, {
  listenTo: 'input'
});

if (process.env.SENTRY_DSN_ENDPOINT){
  Sentry.init({
    Vue: Vue,
    dsn: process.env.SENTRY_DSN_ENDPOINT,
    logErrors: true 
  });
}

Vue.mixin({
  computed: {
    theme() {
      const name = this.$route.name;

      const themes = {
        'create_org': () => 'secondary',
        'orgs': () => 'secondary',
        'projects': () => 'secondary',
        'project_create': () => 'secondary',
        'privacy_policy': () => 'expand',
        'account': ({ org, project }) => {
          if(org && project) return 'normal';
          return 'secondary'
        },
      }

      const org = window.localStorage.getItem('org');
      const project = window.localStorage.getItem('_project');

      return themes[name] ? themes[name]({ org, project }) : 'normal';
    },
  },
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');

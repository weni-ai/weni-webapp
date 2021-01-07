import Vue from 'vue';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import LuigiClient from '@luigi-project/client';

Vue.config.productionTip = false;

Vue.mixin({
  created() {
    this.luigiClient = LuigiClient;
  },
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');

const updateCurrentLanguage = () => {
  i18n.locale = LuigiClient.uxManager().getCurrentLocale();
}
LuigiClient.addInitListener(updateCurrentLanguage);
LuigiClient.addContextUpdateListener(updateCurrentLanguage);


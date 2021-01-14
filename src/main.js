import Vue from 'vue';
import App from './app.vue';
import router from './router';
import store from './store/store';
import i18n from './utils/plugins/i18n';
import LuigiClient from '@luigi-project/client';

Vue.config.productionTip = false;

Vue.mixin({
  created() {
    this.luigiClient = LuigiClient;
  },
});

const updateCurrentLanguage = () => {
  const currentLanguage = LuigiClient.uxManager().getCurrentLocale();
  store.commit('setLanguage', currentLanguage);
  i18n.locale = currentLanguage;
};

const launch = () => {
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app');
}

LuigiClient.addInitListener(() => {
  updateCurrentLanguage();
  launch();
 });

 LuigiClient.addContextUpdateListener(updateCurrentLanguage);


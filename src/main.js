import Vue from 'vue';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import vueDebounce from 'vue-debounce';

Vue.config.productionTip = false;
Vue.use(vueDebounce, {
  listenTo: 'input'
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');

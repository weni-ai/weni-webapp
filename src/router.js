import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/home.vue';
import Account from './views/account.vue';
import Orgs from './views/org/orgs.vue';
import Redirecting from './views/redirecting.vue'
import { rocketChatRedirect, bothubRedirect, pushRedirect } from './utils/plugins/redirect';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
    },
    {
      path: '/orgs',
      name: 'orgs',
      component: Orgs,
    },
    {
      path: '/rocket/',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        rocketChatRedirect();
        next();
      },
    },
    {
      path: '/bothub/',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        bothubRedirect();
        next();
      },
    },
    {
      path: '/push/',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        pushRedirect();
        next();
      },
    },
  ]
});

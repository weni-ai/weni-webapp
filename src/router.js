import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/home.vue';
import Account from './views/account.vue';
import Orgs from './views/org/orgs.vue';
import CreateOrg from './views/org/createOrg.vue';
import Redirecting from './views/redirecting.vue';
import Projects from './views/projects/projects.vue';
import ProjectCreate from './views/projects/ProjectCreate.vue';
import { rocketChatRedirect, bothubRedirect, pushRedirect, projectRedirect } from './utils/plugins/redirect';
import LuigiClient from '@luigi-project/client';

Vue.use(Router);

const router = new Router({
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
      path: '/orgs/create',
      name: 'create_org',
      component: CreateOrg,
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects,
    },
    {
      path: '/projects/create',
      name: 'project_create',
      component: ProjectCreate,
    },
    {
      path: '/rocket/',
      name: 'rocket',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        rocketChatRedirect();
        next();
      },
    },
    {
      path: '/bothub/',
      name: 'bothub',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        bothubRedirect();
        next();
      },
    },
    {
      path: '/push/',
      name: 'push',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        pushRedirect(to);
        next();
      },
    },
    {
      path: '/project/',
      name: 'project',
      component: Redirecting,
      beforeEnter: (to, from, next) => {
        projectRedirect();
        next();
      },
    },
  ]
});

const themes = {
  'create_org': () => 'secondary',
  orgs: () => 'secondary',
  projects: () => 'secondary',
  'project_create': () => 'secondary',
  'account': (org) => { 
    if(org) return 'normal';
    return 'secondary'
  },
}

const requireOrg = {
  home: true,
  bothub: true,
  rocket: true,
  push: true,
}

router.beforeEach((to, from, next) => {
  
  const org = window.localStorage.getItem('org');
  const project = window.localStorage.getItem('_project');

  if (requireOrg[to.name] && (!org || !project)) {
    window.parent.Luigi.navigation().navigate('/orgs/list');
  }

  const theme = themes[to.name] ? themes[to.name](org) : 'normal';
  LuigiClient.sendCustomMessage({id: 'change-theme', theme});
  next();
})


export default router;

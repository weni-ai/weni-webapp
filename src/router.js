import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/home.vue';
import Account from './views/account.vue';
import Orgs from './views/org/orgs.vue';
import CreateOrg from './views/org/createOrg.vue';
import Redirecting from './views/redirecting.vue';
import Projects from './views/projects/projects.vue';
import ProjectCreate from './views/projects/ProjectCreate.vue';
import PrivacyPolicy from './views/privacy-policy.vue';
import Help from './views/help.vue';
import AuthCallback from './views/AuthCallback.vue';
import SecurityService from './services/SecurityService';
import axios from 'axios';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: { name: 'orgs' } },
    {
      path: '/AuthCallback',
      name: 'AuthCallback',
      component: AuthCallback,
    },
    {
      path: '/home/index',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/account/edit',
      name: 'account',
      component: Account,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/orgs/list',
      name: 'orgs',
      component: Orgs,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/orgs/create',
      name: 'create_org',
      component: CreateOrg,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/list',
      name: 'projects',
      component: Projects,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/create',
      name: 'project_create',
      component: ProjectCreate,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/systems/rocketchat',
      name: 'rocket',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/systems/bothub',
      name: 'bothub',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/systems/bothub/:owner/:slug',
      name: 'bothub',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/systems/push',
      name: 'push',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/systems/push/:uuid',
      name: 'push',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/project/index',
      name: 'project',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    },
    {
      path: '/help/index',
      name: 'help',
      component: Help,
      meta: {
        requiresAuth: true,
        requiresProject: true,
      },
    }, {
      path: '/privacy-policy',
      name: 'privacy_policy',
      component: PrivacyPolicy,
    },
  ]
});

try {
  const user = JSON.parse(
    localStorage.getItem(
      `oidc.user:${process.env.VUE_APP_KEYCLOAK_ISSUER}:${process.env.VUE_APP_KEYCLOAK_CLIENT_ID}`
    )
  );

  axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.access_token;
} catch(error) {
  console.log(error);
}

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresProject = to.matched.some(record => record.meta.requiresProject);

  if (requiresAuth) {
      SecurityService.getUser().then(
        success => {
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + success.access_token

          if (success){
            const org = window.localStorage.getItem('org');
            const project = window.localStorage.getItem('_project');

            if (requiresProject && (!org || !project)) {
              next('/orgs/list');
            } else {
              next();
            }
          }else {
            next('/accessdenied');
          }
        },
        err => {
          console.log(err);
        }
      );
      return false;
  } else {
    next();
  }
})


export default router;

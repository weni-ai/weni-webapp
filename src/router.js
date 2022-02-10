import Vue from 'vue';
import Router from 'vue-router';
import { setUTMSInSessionStorage } from './utils/plugins/UTM';

import Home from './views/home.vue';
import Account from './views/account.vue';
import Billing from './views/billing/billing.vue';
import BillingCreateOrg from './views/billing/createOrg.vue';
import AccountConfirm from './views/accountConfirm.vue';
import Orgs from './views/org/orgs.vue';
import CreateOrg from './views/org/createOrg.vue';
import Redirecting from './views/redirecting.vue';
import Projects from './views/projects/projects.vue';
import ProjectCreate from './views/projects/ProjectCreate.vue';
import PrivacyPolicy from './views/privacy-policy.vue';
import Help from './views/help.vue';
import NotFound from './views/not-found.vue';
import Keycloak from './services/Keycloak';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: { name: 'orgs' } },
    {
      path: '/projects/:projectUuid',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
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
      path: '/account/confirm',
      name: 'AccountConfirm',
      component: AccountConfirm,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/orgs',
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
      path: '/orgs/:orgUuid/billing',
      name: 'billing',
      component: Billing,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/orgs/:orgUuid/billing/plans',
      alias: [
        '/orgs/:orgUuid/billing/card',
        '/orgs/:orgUuid/billing/address',
        '/orgs/:orgUuid/billing/success',
      ],
      name: 'BillingPlans',
      component: BillingCreateOrg,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/orgs/:orgUuid/projects',
      name: 'projects',
      component: Projects,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/orgs/:orgUuid/projects/create',
      name: 'project_create',
      component: ProjectCreate,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/integrations/:internal+',
      name: 'integrations',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/rocketchat',
      name: 'rocket',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/bothub/:internal+',
      name: 'bothub',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/bothub/:owner/:slug',
      name: 'bothub',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/studio/:internal+',
      name: 'studio',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/push/:internal+',
      name: 'push',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/settings/:internal+',
      name: 'project',
      component: Redirecting,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/projects/:projectUuid/help',
      name: 'help',
      component: Help,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/privacy-policy',
      name: 'privacy_policy',
      component: PrivacyPolicy,
    },
    { path: '*', name: 'not_found', component: NotFound },
  ],
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth) {
    if (location.search) {
      setUTMSInSessionStorage();
    }

    Keycloak.isAuthenticated()
      .then((authenticated) => {
        if (authenticated) {
          if (to.hash.startsWith('#state=')) {
            next({ ...to, hash: '' });
          } else {
            next();
          }
        } else {
          Keycloak.keycloak.login();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

export default router;

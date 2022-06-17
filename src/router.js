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
        title: 'pages.home',
      },
    },
    {
      path: '/account',
      component: Account,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'edit',
          name: 'account',
          component: null,
        },
        {
          path: 'two-factor',
          name: 'account2fa',
          component: null,
        },
      ],
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
      path: '/academy/:internal+',
      name: 'academy',
      component: null,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/api',
      name: 'api',
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'flows/:internal+',
          name: 'apiFlows',
          component: null,
        },
        {
          path: 'intelligence/:internal+',
          name: 'apiIntelligence',
          component: null,
        },
      ],
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
        title: 'pages.integrations',
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
        title: 'pages.intelligence',
      },
    },
    {
      path: '/projects/:projectUuid/bothub/:owner/:slug',
      name: 'bothub',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        title: 'pages.intelligence',
      },
    },
    {
      path: '/projects/:projectUuid/studio/:internal+',
      name: 'studio',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        title: 'pages.studio',
      },
    },
    {
      path: '/projects/:projectUuid/push/:internal+',
      name: 'push',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        title: 'pages.flows',
      },
    },
    {
      path: '/projects/:projectUuid/settings/:internal+',
      name: 'project',
      component: Redirecting,
      meta: {
        requiresAuth: true,
        title: 'pages.settings',
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
      path: '/terms-of-service-privacy-and-cookie-policy',
      name: 'privacy_policy',
      component: PrivacyPolicy,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/organization-require-two-factor',
      name: 'OrganizationRequireTwoFactor',
      component: NotFound,
      props: {
        type: 'organization-require-two-factor',
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '*',
      name: 'not_found',
      component: NotFound,
      meta: {
        requiresAuth: false,
      },
    },
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
  } else {
    next();
  }
});

export default router;

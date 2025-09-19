import { createRouter, createWebHistory, RouterView } from 'vue-router';

import Home from './views/home.vue';
import Account from './views/account.vue';
import Billing from './views/billing/billing.vue';
import BillingPlans from './views/billing/plans/BillingPlans.vue';
import Orgs from './views/org/orgs.vue';
import Redirecting from './views/redirecting.vue';
import Projects from './views/projects/projects.vue';
import PrivacyPolicy from './views/privacy-policy.vue';
import Help from './views/help.vue';
import Settings from './views/settings.vue';
import Register from './views/register/index.vue';
import NotFound from './views/not-found.vue';
import Keycloak from './services/Keycloak';

const routes = [
  { path: '/', redirect: { name: 'orgs' } },
  {
    path: '/register',
    meta: {
      afterKeycloakInitialization(authenticated, next) {
        if (authenticated) {
          next({ name: 'orgs' });

          return;
        }

        const redirectUri = new URL(location.origin);

        const UTMParams = Array.from(
          new URLSearchParams(location.search),
        ).filter(([name]) => name.toLowerCase().startsWith('utm_'));

        UTMParams.forEach(([name, value]) =>
          redirectUri.searchParams.append(name, value),
        );

        window.location.replace(
          Keycloak.keycloak.createRegisterUrl({
            redirectUri: redirectUri.href,
          }),
        );
      },
    },
  },
  {
    path: '/projects/:projectUuid/settings',
    redirect: ({ name, params }) => {
      if (name === 'settings') {
        return {
          path: `/projects/${params.projectUuid}/settings/project/org/home`,
        };
      }
    },
    name: 'settings',
    component: Settings,
    children: [
      {
        path: 'project/:internal+',
        name: 'settingsProject',
        component: RouterView,
        meta: {
          requiresAuth: true,
          title: 'pages.settings',
        },
      },
      {
        path: 'chats/:internal+',
        name: 'settingsChats',
        component: RouterView,
        meta: {
          requiresAuth: true,
          title: 'pages.settings',
          hideBottomRightOptions: true,
        },
      },
    ],
  },
  {
    path: '/projects/:projectUuid',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true,
      title: 'pages.home',
    },
    children: [
      {
        path: 'bulkSend',
        name: 'bulkSendInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/bulkSend/init` };
        },
      },
      {
        path: 'bulkSend/:internal+',
        name: 'bulkSend',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.bulkSend',
          hideBottomRightOptions: true,
        },
      },
      {
        path: 'insights',
        name: 'insightsInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/insights/init` };
        },
      },
      {
        path: 'insights/:internal+',
        name: 'insights',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          forceContractedSidebar: true,
          hideBottomRightOptions: true,
        },
      },
      {
        path: 'agent-builder',
        name: 'agentBuilderInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/agent-builder/init` };
        },
      },
      {
        path: 'agent-builder/:internal+',
        name: 'agentBuilder',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.intelligence',
          forceContractedSidebar: true,
        },
      },
      {
        path: 'bothub/:owner/:slug',
        name: 'bothub',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.intelligence',
          forceContractedSidebar: true,
        },
      },
      {
        path: 'bothub',
        name: 'bothubInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/bothub/init` };
        },
      },
      {
        path: 'bothub/:internal+',
        name: 'bothub',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.intelligence',
          forceContractedSidebar: true,
        },
      },
      {
        path: 'commerce',
        name: 'commerceInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/commerce/init` };
        },
      },
      {
        path: 'commerce/:internal+',
        name: 'commerce',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.commerce',
          forceContractedSidebar: true,
        },
      },{
        path: 'gallery',
        name: 'galleryInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/gallery/init` };
        },
      },
      {
        path: 'gallery/:internal+',
        name: 'gallery',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.gallery',
          forceContractedSidebar: true,
        },
      },
      {
        path: 'push',
        name: 'pushInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/push/init` };
        },
      },
      {
        path: 'push/:internal+',
        name: 'push',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.flows',
          forceContractedSidebar: true,
        },
      },
      {
        path: 'studio',
        name: 'studioInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/studio/init` };
        },
      },
      {
        path: 'studio/:internal+',
        name: 'studio',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.studio',
          forceContractedSidebar: true,
        },
      },
      {
        path: 'chats',
        name: 'chatsInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/chats/init` };
        },
      },
      {
        path: 'chats/:internal+',
        name: 'chats',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          forceContractedSidebar: true,
          hideBottomRightOptions: true,
        },
      },
      {
        path: 'integrations',
        name: 'integrationsInit',
        redirect: ({ params }) => {
          return { path: `/projects/${params.projectUuid}/integrations/init` };
        },
      },
      {
        path: 'integrations/:internal+',
        name: 'integrations',
        component: Redirecting,
        meta: {
          requiresAuth: true,
          title: 'pages.integrations',
        },
      },
    ],
  },
  {
    path: '/projects/:projectUuid/get-started',
    name: 'HomeGetStarted',
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
        path: 'preferences',
        name: 'accountPreferences',
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
    component: Account,
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
      title: 'pages.academy',
    },
  },
  {
    path: '/api',
    name: 'api',
    meta: {
      requiresAuth: true,
      title: 'pages.apis',
    },
    children: [
      {
        path: 'flows/:internal+',
        name: 'apiFlows',
        component: null,
        meta: {
          title: 'pages.apis',
        },
      },
      {
        path: 'intelligence/:internal+',
        name: 'apiIntelligence',
        component: null,
        meta: {
          title: 'pages.apis',
        },
      },
      {
        path: 'nexus/:internal+',
        name: 'apiNexus',
        component: null,
        meta: {
          title: 'pages.apis',
        },
      },
    ],
  },
  {
    path: '/orgs',
    name: 'orgs',
    component: Orgs,
    meta: {
      requiresAuth: true,
      title: 'pages.orgs',
    },
  },
  {
    path: '/orgs/required',
    name: 'OrgsRequired',
    component: Orgs,
    meta: {
      requiresAuth: true,
      title: 'pages.orgs',
    },
  },
  {
    path: '/orgs/create',
    name: 'create_org',
    component: Register,
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
    component: BillingPlans,
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
      title: 'pages.projects',
    },
  },
  {
    path: '/orgs/:orgUuid/projects/create',
    name: 'project_create',
    component: Register,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projectUuid/help',
    redirect: () => {
      return { path: '/help' };
    },
  },
  {
    path: '/help',
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
    path: '/:pathMatch(.*)*',
    name: 'not_found',
    component: NotFound,
    meta: {
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  let afterKeycloakInitialization;

  to.matched.forEach((record) => {
    if (record.meta.afterKeycloakInitialization) {
      afterKeycloakInitialization = record.meta.afterKeycloakInitialization;
    }
  });

  if (requiresAuth || afterKeycloakInitialization) {
    const authenticated = await Keycloak.isAuthenticated();

    if (afterKeycloakInitialization) {
      afterKeycloakInitialization(authenticated, next);

      return;
    }

    if (authenticated) {
      if (to.hash.startsWith('#state=')) {
        next({ ...to, hash: '' });
      } else {
        const externals = [
          'studio',
          'push',
          'bothub',
          'rocket',
          'integrations',
          'settingsProject',
          'chats',
          'insights',
          'bulkSend',
        ];

        if (
          externals.includes(to.name) &&
          from.name === to.name &&
          to.params?.internal === 'init'
        ) {
          next({
            name: to.name,
            params: {
              internal: ['init', 'force'],
            },
          });
        } else {
          next();
        }
      }
    } else {
      Keycloak.keycloak.login();
    }
  } else {
    next();
  }
});

export { routes };

export default router;

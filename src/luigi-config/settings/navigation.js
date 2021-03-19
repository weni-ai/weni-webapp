export const navigation = {
    nodes: () => [
      {
        pathSegment: 'home',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'index',
            label: 'SIDEBAR.HOME',
            icon: 'house-1-1',
            viewUrl: '/sampleapp.html#/home',
            category: 'SIDEBAR.MAIN_MENU',
            anonymousAccess: false,
          },
        ]
      },
      {
        pathSegment: 'systems',
        label: 'SIDEBAR.HOME',
        viewUrl: '/sampleapp.html#/home',
        anonymousAccess: false,
        children: [
          {
            pathSegment: 'push',
            label: 'SIDEBAR.PUSH',
            icon: 'hierarchy-3-2',
            viewUrl: '/sampleapp.html#/push',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'bothub',
            label: 'SIDEBAR.BH',
            icon: 'science-fiction-robot-2',
            viewUrl: '/sampleapp.html#/bothub',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: false,
          },
          {
            pathSegment: 'rocketchat',
            label: 'SIDEBAR.RC',
            icon: 'messaging-we-chat-3',
            viewUrl: '/sampleapp.html#/rocket',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: false,
          },
        ]
      },
      {
        pathSegment: 'account',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'edit',
            label: 'SIDEBAR.ACCOUNT',
            icon: 'single-neutral-actions-1',
            viewUrl: '/sampleapp.html#/account',
            anonymousAccess: false,
            category: 'SIDEBAR.PROFILE',
          },
        ]
      },
      {
        pathSegment: 'billing',
        anonymousAccess: true,
        label: 'billing',
        viewUrl: '/sampleapp.html#/billing',
        hideFromNav: true,
        children: [],
      },
      {
        pathSegment: 'orgs',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'list',
            label: 'list orgs',
            icon: 'single-neutral-actions-1',
            viewUrl: '/sampleapp.html#/orgs',
            anonymousAccess: false,
            hideFromNav: true,
          },
          {
            pathSegment: 'create',
            label: 'create org',
            viewUrl: '/sampleapp.html#/orgs/create',
            anonymousAccess: false,
            hideFromNav: true,
          },
        ]
      },
      {
        pathSegment: 'projects',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'list',
            viewUrl: '/sampleapp.html#/projects',
            anonymousAccess: false,
            hideFromNav: true,
          },
          {
            pathSegment: 'create',
            viewUrl: '/sampleapp.html#/projects/create',
            anonymousAccess: false,
            hideFromNav: true,
          },
        ]
      },
    ]
  };
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
            anonymousAccess: true,
          },
          {
            pathSegment: 'account',
            label: 'Account',
            icon: '',
            viewUrl: '/sampleapp.html#/account',
            anonymousAccess: false,
            hideFromNav: true,
          },
        ]
      },
      {
        pathSegment: 'systems',
        label: 'SIDEBAR.HOME',
        viewUrl: '/sampleapp.html#/home',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'bothub',
            label: 'SIDEBAR.BH',
            icon: 'science-fiction-robot-2',
            viewUrl: 'https://development.bothub.it/',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'push',
            label: 'SIDEBAR.PUSH',
            icon: 'hierarchy-3-2',
            viewUrl: 'https://rp-connect.push.al/oidc/authenticate/',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
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
            anonymousAccess: true,
          },
        ]
      },
    ]
  };
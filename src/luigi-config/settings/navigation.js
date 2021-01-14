export const navigation = {
    nodes: () => [
      {
        pathSegment: 'dashboard',
        label: 'h',
        viewUrl: '/sampleapp.html#/home',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'home',
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
            viewUrl: 'https://platform-rocket-test.push.al/',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
        ]
      }
    ]
  };
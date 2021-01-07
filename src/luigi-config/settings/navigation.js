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
            label: 'Home',
            icon: 'house-2-2',
            viewUrl: '/sampleapp.html#/home',
            category: 'Main menu',
            anonymousAccess: true,
          },
          {
            pathSegment: 'login',
            label: 'Login',
            icon: 'gauge-dashboard-2',
            viewUrl: '/sampleapp.html#/login',
            category: 'Main menu',
            anonymousAccess: true,
          },
          {
            pathSegment: 'bothub',
            label: 'Bothub',
            icon: 'science-fiction-robot-2',
            // viewUrl: 'https://development.bothub.it/',
            viewUrl: 'http://localhost:8081/',
            category: 'Systems',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'push',
            label: 'Push',
            icon: 'hierarchy-3-2',
            viewUrl: 'https://rp-connect.push.al/oidc/authenticate/',
            category: 'Systems',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'rocketchat',
            label: 'RocketChat',
            icon: 'messaging-we-chat-2',
            viewUrl: 'https://platform-rocket-test.push.al/',
            category: 'Systems',
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
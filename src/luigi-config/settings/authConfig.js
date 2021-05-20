import oidcProvider from '@luigi-project/plugin-auth-oidc';

const getProfile = async (authSettings, authData) => {
  const token = authData.accessToken;
  if (!token) return {};
  const response = await fetch(`${process.env.VUE_APP_ROOT_API}v1/account/my-profile/`, {
      method: 'GET',
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  const json = await response.json();

  if (
    response.status !== 200
    && ![ '/privacy-policy' ]
      .some((href) => window.location.pathname.startsWith(href))
  ) {
    Luigi.auth().login();
  }

  window.localStorage.setItem('user', JSON.stringify(json));
  
  return json;
};

const removeSaveData = () => {
  window.localStorage.removeItem('project');
  window.localStorage.removeItem('_project');
  window.localStorage.removeItem('user');
  window.localStorage.removeItem('org');
  window.localStorage.removeItem('lastEmote');
  const date = new Date();
  document.getElementById('weni-navbar').setAttribute('orgUpdate', date);
};

export const auth = () => {
  return {
    use: 'openIdConnect',
    openIdConnect: {
      idpProvider: oidcProvider,
      authority: `${process.env.KEYCLOAK_URL}auth/realms/${process.env.KEYCLOAK_REALM}`,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      response_type: 'code',
      response_mode: 'fragment',
      automaticSilentRenew: true,
      userInfoFn: getProfile,
      accessTokenExpiringNotificationTime: 60,
    },
    disableAutoLogin: true,
    events: {
      onAuthSuccessful: removeSaveData,
      onLogout: removeSaveData,
    },
  };
};
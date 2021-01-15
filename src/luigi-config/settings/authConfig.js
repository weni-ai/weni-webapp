import oidcProvider from '@luigi-project/plugin-auth-oidc';
// import axios from 'axios';

const getProfile = async (authSettings, authData) => {
  const token = authData.accessToken;
  const response = fetch('http://api-connect.push.al/v1/account/my-profile/', {
      method: 'GET',
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await response.json();
    return json;
}

export const auth =  {
  use: 'openIdConnect',
  openIdConnect: {
    idpProvider: oidcProvider,
    authority: 'http://keycloak-connect.push.al/auth/realms/ilhasoft/',
    client_id: 'connect-frontend',
    response_type: 'code',
    response_mode: 'fragment',
    automaticSilentRenew: true,
    userInfoFn: getProfile,
    accessTokenExpiringNotificationTime: 60,
  },
  disableAutoLogin: true,
};
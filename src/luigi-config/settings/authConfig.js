import oidcProvider from '@luigi-project/plugin-auth-oidc';
// import axios from 'axios';

const getProfile = async (authSettings, authData) => {
  const token = authData.accessToken;
  const response = fetch(`${process.env.VUE_APP_ROOT_API}v1/account/my-profile/`, {
      method: 'GET',
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await response.json();
    return json;
}

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
  };
};
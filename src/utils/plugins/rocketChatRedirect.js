import store from '../../store/store';

export const rocketChatRedirect = async () => {
  const accessToken = store.getters.authToken;
  const apiUrl = process.env.VUE_APP_RC_URL;
  const response = await fetch(`${apiUrl}/api/v1/login/`, { 
    method: "POST",
    body: JSON.stringify({
      serviceName: 'keycloak',
      accessToken,
      expiresIn: 200,
    }),       
    headers: { 
     'Content-type': 'application/json; charset=UTF-8',
    }
   });
    const json = await response.json();
    window.location.replace(`${apiUrl}/home?resumeToken=${json.data.authToken}`);
    return response.data.authToken;
}
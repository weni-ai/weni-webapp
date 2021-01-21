import store from '../../store/store';
import axios from 'axios';

export const rocketChatRedirect = async () => {
  const accessToken = store.getters.authToken;

  try {
    const rocketResponse = await axios.get(
      `${process.env.VUE_APP_ROOT_API}v1/dashboard/info/`,
      { headers: {
        Authorization: `Bearer ${accessToken}`,
      } 
    });
  
    const [apiUrl] = rocketResponse.data.menu.chat;
    console.log({ apiUrl });
    if (!apiUrl) return null;
  
    const response = await axios.post(
      `${apiUrl}/api/v1/login/`, 
      {
        serviceName: 'keycloak',
        accessToken,
        expiresIn: 200,
      },
      {
        headers: { 
          'Content-type': 'application/json; charset=UTF-8',
         }
      }
    );
  
    const json = response.data;
    window.location.replace(`${apiUrl}/home?resumeToken=${json.data.authToken}`);
    return response.data.authToken;
  } catch(e) {
    return e;
  }
}
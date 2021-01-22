import store from '../../store/store';
import axios from 'axios';

const getRedirectUrls = async () => {
  const accessToken = store.getters.authToken;

    return axios.get(
      `${process.env.VUE_APP_ROOT_API}v1/dashboard/info/`,
      { headers: {
        Authorization: `Bearer ${accessToken}`,
      } 
    });
};

export const rocketChatRedirect = async () => {
  const accessToken = store.getters.authToken;

  try {
    const rocketResponse = await getRedirectUrls();
  
    const [apiUrl] = rocketResponse.data.menu.chat;
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
};

export const bothubRedirect = async () => {
  const accessToken = store.getters.authToken;

  try {
    const rocketResponse = await getRedirectUrls();
  
    const apiUrl = rocketResponse.data.menu.inteligence;
    console.log({ apiUrl });
    if (!apiUrl) return null;
  
    const token = `Bearer+${accessToken}`;
    console.log(token);
    window.location.replace(`${apiUrl}/loginexternal/${token}`);
  } catch(e) {
    return e;
  }
};

export const pushRedirect = async () => {

  try {
    const rocketResponse = await getRedirectUrls();
  
    const apiUrl = rocketResponse.data.menu.flows;
    console.log({ apiUrl });
    if (!apiUrl) return null;
  
    window.location.replace(apiUrl);
  } catch(e) {
    return e;
  }
};

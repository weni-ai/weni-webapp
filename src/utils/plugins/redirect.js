import store from '../../store';
import axios from 'axios';

const getRedirectUrls = async () => {
  const accessToken = store.getters.authToken();

  try {
    const { uuid } = JSON.parse(localStorage.getItem('_project'));

    return axios.get(
      `${process.env.VUE_APP_ROOT_API}v1/organization/project/${uuid}/`,
      { headers: {
        Authorization: `Bearer ${accessToken}`,
      } 
    });

  } catch(e) {
    console.log('error', e);
  }
};

export const rocketChatRedirect = async () => {
  const accessToken = store.getters.authToken();

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
  const accessToken = store.getters.authToken();

  try {
    const rocketResponse = await getRedirectUrls();
    const { inteligence_organization } = JSON.parse(localStorage.getItem('org'));
  
    const apiUrl = rocketResponse.data.menu.inteligence;
    if (!apiUrl) return null;
  
    const token = `Bearer+${accessToken}`;
    window.location.replace(`${apiUrl}loginexternal/${token}/${inteligence_organization}`);
  } catch(e) {
    return e;
  }
};

export const pushRedirect = async () => {

  try {
    const { flow_organization } = JSON.parse(localStorage.getItem('_project'));

    const rocketResponse = await getRedirectUrls();
  
    const apiUrl = rocketResponse.data.menu.flows;
    if (!apiUrl) return null;
  
    window.location.replace(`${apiUrl}weni/authenticate/${flow_organization.uuid}`);
  } catch(e) {
    return e;
  }
};


export const projectRedirect = async () => {
  try {
    const rocketResponse = await getRedirectUrls();
    const { flow_organization } = JSON.parse(localStorage.getItem('_project'));
  
    let apiUrl = rocketResponse.data.menu.flows;
    if (!apiUrl) return null;

    apiUrl = 'https://flows-staging.weni.ai/'; // temp

    window.location.replace(`${apiUrl}weni/${flow_organization.uuid}/config`);
  } catch(e) {
    return e;
  }
};
export default {

rocketChatLogin: async (apiUrl, frame, accessToken) => {

  const response = await fetch(`${apiUrl}api/v1/login/`, { 
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
    return response.data.authToken;
  }
}
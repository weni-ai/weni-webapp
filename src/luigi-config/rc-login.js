// import axios from 'axios';

export default {

    rocketChatLogin: async (frame, accessToken) => {

        const apiUrl = frame.src;

        fetch(`${apiUrl}api/v1/login/`, { 
            method: "POST",
            body: JSON.stringify({
                serviceName: 'keycloak',
                accessToken,
                expiresIn: 200,
            }),       
            headers: { 
                'Content-type': 'application/json; charset=UTF-8',
            } 
        }).then(response => response.json().then(response => {
                console.log(response);
                console.log(frame.contentWindow, apiUrl);
                frame.contentWindow.postMessage({
                    event: 'login-with-token',
                    loginToken: response.data.authToken,
                }, apiUrl);
            })
        )
    }
}
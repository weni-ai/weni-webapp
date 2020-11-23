// import axios from 'axios';

export default {

    rocketChatLogin: (frame, accessToken) => {
        const apiUrl = frame.src;
        console.log(frame, frame.contentWindow);
    
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
                frame.contentWindow.postMessage({
                    event: 'login-with-token',
                    loginToken: response.data.authToken,
                }, apiUrl);
            })
        )
    }
}
import axios from 'axios';

const frame = document.getElementById('rc');
console.log({frame});
const apiUrl = 'http://19ceb3782fbe.ngrok.io/';
axios.post(`${apiUrl}api/v1/login`, {
  username: 'new-user',
  password: 'new-users-passw0rd'
}).then(function (response) {
    console.log({ response } );
    if (response.data.status === 'success') {
        frame.contentWindow.postMessage({
            event: 'login-with-token',
            loginToken: response.data.data.authToken,
        }, apiUrl);
    }
})
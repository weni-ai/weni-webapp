export default {
  bothubLogin: async (srcUrl, frame, accessToken) => {
    frame.contentWindow.postMessage({
      event: 'login-with-token',
      token: accessToken,
    }, srcUrl);
    console.log('posted message')
  }
}
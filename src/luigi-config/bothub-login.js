export default {
  bothubLogin: async (srcUrl, frame, accessToken) => {
    frame.contentWindow.postMessage({
      event: 'login-with-token',
      token: `Bearer ${accessToken}`,
    }, srcUrl);
    console.log('posted message')
  }
}
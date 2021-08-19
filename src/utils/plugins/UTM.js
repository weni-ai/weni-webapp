export function setUTMSInSessionStorage() {
  let self = window.location.toString();
  let querystring = self.split('?');
  if (querystring.length > 1) {
    let pairs = querystring[1].split('&');
    let utms = [];
    for (let i in pairs) {
      let keyval = pairs[i].split('=');
      if (keyval[0].substring(0, 4) === 'utm_') {
        utms.push(keyval);
      }
    }
    let utmObj = Object.fromEntries(utms);
    sessionStorage.setItem('utms', JSON.stringify(utmObj));
  }
}

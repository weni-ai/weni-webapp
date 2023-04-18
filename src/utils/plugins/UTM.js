export function setUTMSInSessionStorage() {
  const utms = {};

  new URLSearchParams(location.search).forEach((value, key) => {
    if (key.startsWith('utm_')) {
      utms[key] = value;
    }
  });

  if (Object.keys(utms).length) {
    sessionStorage.setItem('utms', JSON.stringify(utms));
  }
}

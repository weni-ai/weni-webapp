import { setUTMSInSessionStorage } from '@/utils/plugins/UTM.js';

describe('UTM.js', () => {
  it('it should not save utms attributes to sessionStorage due there is no utms attributes', () => {
    setUTMSInSessionStorage();

    expect(sessionStorage.getItem('utms')).toBe(null);
  });

  it('it should save utms attributes to sessionStorage', () => {
    delete window.location;

    window.location = new URL(
      'http://localhost/?' +
        new URLSearchParams({
          utm_first_name: 'joão',
          utm_last_name: 'maria',
          email: 'joao@maria.com',
        }).toString(),
    );

    setUTMSInSessionStorage();

    expect(sessionStorage.getItem('utms')).toBe(
      JSON.stringify({
        utm_first_name: 'joão',
        utm_last_name: 'maria',
      }),
    );
  });
});

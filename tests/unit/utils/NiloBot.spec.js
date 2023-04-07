import '@/utils/NiloBot.js';

describe('NiloBot.js', () => {
  let webchat;

  it('it should have 2 scripts in head section when webchat script is loaded', () => {
    document.querySelector('script').dispatchEvent(new CustomEvent('load'));

    expect(document.head.querySelectorAll('script').length).toBe(2);
  });

  it('it should not do change HTML due webchat element does not exist yet', () => {
    const beforeHTML = document.documentElement.outerHTML;

    window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));

    expect(document.documentElement.outerHTML).toBe(beforeHTML);
  });

  it('it should hide and show webchat element when respective events were called', () => {
    webchat = document.createElement('div');
    webchat.setAttribute('id', 'wwc');

    document.body.appendChild(webchat);

    window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));

    expect(webchat.style.display).toBe('none');

    window.dispatchEvent(new CustomEvent('showBottomRightOptions'));

    expect(webchat.style.display).toBe('');
  });
});

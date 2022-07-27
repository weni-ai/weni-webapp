import sendAllIframes from '@/utils/plugins/sendAllIframes.js';

describe('sendAllIframes.js', () => {
  it('should send message to iframes', () => {
    let spyPostMessage = null;

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    spyPostMessage = jest.spyOn(iframe.contentWindow, 'postMessage');

    const sents = sendAllIframes('test', { data: 'message' });

    expect(spyPostMessage).toHaveBeenCalledWith(
      { data: 'message', event: 'test' },
      '*',
    );

    expect(sents).toBe(1);
  });

  it('should not send message due postMessage does not exist', () => {
    document.querySelectorAll('iframe')[0].contentWindow.postMessage = null;

    const sents = sendAllIframes('test', { data: 'message' });

    expect(sents).toBe(0);
  });
});

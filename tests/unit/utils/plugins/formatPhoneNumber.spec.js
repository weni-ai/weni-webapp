import formatPhoneNumber from '@/utils/plugins/formatPhoneNumber.js';

describe('formatPhoneNumber.js', () => {
  let input;

  beforeEach(() => {
    input = document.createElement('input');
    document.body.appendChild(input);
  });

  it('it should format phone number', () => {
    formatPhoneNumber(input, () => {});

    input.value = '';
    input.dispatchEvent(new CustomEvent('input'));

    expect(input.value).toBe('');

    input.value = '5';
    input.dispatchEvent(new CustomEvent('input'));

    expect(input.value).toBe('+5');

    input.value = '558';
    input.dispatchEvent(new CustomEvent('input'));

    expect(input.value).toBe('+55 8');

    input.value = '55829';
    input.dispatchEvent(new CustomEvent('input'));

    input.value = '558299999';
    input.dispatchEvent(new CustomEvent('input'));

    expect(input.value).toBe('+55 82 9999-9');

    input.value = '5582999999999';
    input.selectionStart = input.selectionEnd = 5;
    input.dispatchEvent(new CustomEvent('input'));

    expect(input.value).toBe('+55 82 99999-9999');
  });
});

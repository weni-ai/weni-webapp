import { vi } from 'vitest';

vi.mock('vue-qrcode-component', () => ({
  template: '<p>qr code stub</p>',
}));

vi.mock('@vue-stripe/vue-stripe', () => ({
  StripePlugin: vi.fn(),
}));

const localStorageMock = () => {
  const storage = {};

  return {
    setItem: function (key, value) {
      storage[key] = value || '';
    },
    getItem: function (key) {
      return key in storage ? storage[key] : null;
    },
    removeItem: function (key) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function (i) {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
  };
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

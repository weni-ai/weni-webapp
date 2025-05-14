import { vi } from 'vitest';
import { config } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-qrcode-component', () => ({
  template: '<p>qr code stub</p>',
}));

vi.mock('@vue-stripe/vue-stripe', () => ({
  StripePlugin: vi.fn(),
}));

vi.mock('insights/locales/en', () => ({
  default: {
    hello: 'Hello from mock',
  },
}));

vi.mock('insights/locales/es', () => ({
  default: {
    hello: 'Hello from mock',
  },
}));

vi.mock('insights/locales/pt_br', () => ({
  default: {
    hello: 'Hello from mock',
  },
}));

vi.mock('commerce/locales/en_us', () => ({
  default: {
    hello: 'Hello from mock',
  },
}));

vi.mock('commerce/locales/es_es', () => ({
  default: {
    hello: 'Hello from mock',
  },
}));

vi.mock('commerce/locales/pt_br', () => ({
  default: {
    hello: 'Hello from mock',
  },
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

config.global.plugins = [i18n];

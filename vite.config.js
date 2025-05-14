import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), svgLoader({ defaultImport: 'url' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      '@weni/unnnic-system': path.resolve(
        __dirname,
        'node_modules/@weni/unnnic-system',
      ),
      'insights/locales/en': path.resolve(
        __dirname,
        'tests/unit/__mocks__/insights/en.js',
      ),
      'insights/locales/es': path.resolve(
        __dirname,
        'tests/unit/__mocks__/insights/es.js',
      ),
      'insights/locales/pt_br': path.resolve(
        __dirname,
        'tests/unit/__mocks__/insights/pt_br.js',
      ),
      'commerce/locales/en_us': path.resolve(
        __dirname,
        'tests/unit/__mocks__/commerce/en_us.js',
      ),
      'commerce/locales/es_es': path.resolve(
        __dirname,
        'tests/unit/__mocks__/commerce/es_es.js',
      ),
      'commerce/locales/pt_br': path.resolve(
        __dirname,
        'tests/unit/__mocks__/commerce/pt_br.js',
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@weni/unnnic-system/src/assets/scss/unnnic.scss';
        `,
      },
    },
  },
});

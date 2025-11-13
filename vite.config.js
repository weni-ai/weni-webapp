import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import path from 'path';

const localeConfig = {
  insights: ['en', 'es', 'pt_br'],
  commerce: ['en_us', 'es_es', 'pt_br'],
};

const moduleMockPaths = [
  'insights/main',
  'insights/dashboard-commerce',
  'commerce/solution-card',
  'integrations/main',
  'bulk_send/main',
  'agent_builder/main',
];

function generateModulesLocalesAliases() {
  return Object.entries(localeConfig).reduce((aliases, [module, languages]) => {
    languages.forEach((lang) => {
      aliases[`${module}/locales/${lang}`] = path.resolve(
        __dirname,
        'tests/unit/__mocks__/localeMock.js',
      );
    });
    return aliases;
  }, {});
}

function generateModuleMockAliases() {
  return moduleMockPaths.reduce((aliases, modulePath) => {
    aliases[modulePath] = path.resolve(
      __dirname,
      'tests/unit/__mocks__/moduleMock.js',
    );
    return aliases;
  }, {});
}

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
      ...generateModulesLocalesAliases(),
      ...generateModuleMockAliases(),
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

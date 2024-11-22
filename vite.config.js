import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import path from 'path';
import { federation } from '@module-federation/vite';

export default defineConfig(async () => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: path.resolve(
        __dirname,
        './node_modules/vue/dist/vue.runtime.esm-bundler.js',
      ),
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      '@weni/unnnic-system': path.resolve(
        __dirname,
        'node_modules/@weni/unnnic-system',
      ),
    },
  },
  build: {
    target: 'chrome89',
  },
  plugins: [
    federation({
      name: 'host',
      remotes: {
        remote: {
          type: 'module',
          name: 'remote',
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'remote',
          shareScope: 'default',
        },
      },
      exposes: {},
      filename: 'remoteEntry.js',
    }),
    vue(),
    vueJsx(),
    svgLoader({ defaultImport: 'url' }),
  ],
  proxy: { '/src/components': 'http://localhost:4174/' },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@weni/unnnic-system/src/assets/scss/unnnic.scss';
        `,
      },
    },
  },
}));

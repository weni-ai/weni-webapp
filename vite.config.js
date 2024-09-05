import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import svgLoader from 'vite-svg-loader';
import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';

const htmlTransform = () => ({
  name: 'html-transform',
  apply: 'build',
  closeBundle() {
    const indexPath = path.resolve(__dirname, 'dist', 'index.html');

    const hash = createHash('md5')
      .update(Date.now().toString())
      .digest('hex')
      .substring(0, 8);

    let html = fs.readFileSync(indexPath, 'utf-8');

    // Added the query string ?v=[hash] for CSS and JS only
    html = html.replace(/(\/assets\/weni\.(js|css))/g, `$1?v=${hash}`);

    fs.writeFileSync(indexPath, html);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader({ defaultImport: 'url' }), htmlTransform()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      '@weni/unnnic-system': path.resolve(
        __dirname,
        'node_modules/@weni/unnnic-system',
      ),
      vue: path.resolve(__dirname, './node_modules/vue/dist/vue.esm.js'),
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
  build: {
    rollupOptions: {
      output: {
        // Define o nome dos arquivos sem hash
        entryFileNames: 'assets/weni.js',
        chunkFileNames: 'assets/weni.js', // Caso tenha chunks, também aplica o nome fixo
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/weni.css'; // Define o nome do arquivo CSS sem hash
          }
          return 'assets/' + assetInfo.name;
        },
      },
    },
  },
});

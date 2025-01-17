require('dotenv').config();
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { gitDescribeSync } = require('git-describe');

import.meta.env.HASH = `${Math.random().toString(36).substring(2, 8)}-${
  gitDescribeSync().hash
}`;
import.meta.env.PACKAGE_VERSION = import.meta.env.npm_package_version;
import.meta.env.SENTRY_DSN_ENDPOINT =
  import.meta.env.SENTRY_DSN_ENDPOINT || '';
import.meta.env.STRIPE_API = import.meta.env.STRIPE_API || '';
import.meta.env.URL_ACADEMY = import.meta.env.URL_ACADEMY || '';

module.exports = {
  devServer: {
    disableHostCheck: true,
  },
  lintOnSave: true,
  transpileDependencies: true,
  runtimeCompiler: true,
  outputDir: 'dist',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'css-loader',
            {
              loader: 'vue-style-loader',
              options: {
                shadowMode: true,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: ['sass-loader'],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin(
        [
          { context: 'public', to: 'index.html', from: 'index.html' },
          // {
          //   from: 'node_modules/fundamental-styles/dist',
          //   to: './fundamental-styles'
          // },
          {
            from: 'node_modules/@weni/unnnic-system/dist/img',
            to: './img',
          },
          {
            context: 'node_modules/@weni/unnnic-system/dist',
            to: 'unnnic.css',
            from: 'unnnic.css',
          },
        ],
        {
          ignore: ['.gitkeep', '**/.DS_Store', '**/Thumbs.db'],
          debug: 'warning',
        },
      ),
    ],
  },
};

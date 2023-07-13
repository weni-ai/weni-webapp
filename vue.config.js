require('dotenv').config();
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { gitDescribeSync } = require('git-describe');

process.env.VUE_APP_HASH = `${Math.random().toString(36).substring(2, 8)}-${
  gitDescribeSync().hash
}`;
process.env.VUE_APP_PACKAGE_VERSION = process.env.npm_package_version;
process.env.VUE_APP_SENTRY_DSN_ENDPOINT = process.env.SENTRY_DSN_ENDPOINT || '';
process.env.VUE_APP_STRIPE_API = process.env.VUE_APP_STRIPE_API || '';
process.env.VUE_APP_URL_ACADEMY = process.env.VUE_APP_URL_ACADEMY || '';

module.exports = {
  devServer: {
    allowedHosts: 'all',
  },
  lintOnSave: true,
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

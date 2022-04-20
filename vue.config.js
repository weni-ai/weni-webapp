require('dotenv').config();
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { gitDescribeSync } = require('git-describe');

process.env.VUE_APP_HASH = `${Math.random().toString(36).substring(2, 8)}-${
  gitDescribeSync().hash
}`;
process.env.VUE_APP_PACKAGE_VERSION = process.env.npm_package_version;
process.env.VUE_APP_KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER;
process.env.VUE_APP_KEYCLOAK_AUTHORIZATION_ENDPOINT =
  process.env.KEYCLOAK_AUTHORIZATION_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_USERINFO_ENDPOINT =
  process.env.KEYCLOAK_USERINFO_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_END_SESSION_ENDPOINT =
  process.env.KEYCLOAK_END_SESSION_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_JWKS_URI = process.env.KEYCLOAK_JWKS_URI;
process.env.VUE_APP_KEYCLOAK_TOKEN_ENDPOINT =
  process.env.KEYCLOAK_TOKEN_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_CHECK_SESSION_IFRAME =
  process.env.KEYCLOAK_CHECK_SESSION_IFRAME;
process.env.VUE_APP_KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
process.env.VUE_APP_KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
process.env.VUE_APP_SENTRY_DSN_ENDPOINT = process.env.SENTRY_DSN_ENDPOINT || '';
process.env.VUE_APP_STRIPE_API = process.env.VUE_APP_STRIPE_API || '';
process.env.VUE_APP_LOGROCKET_ID = process.env.LOGROCKET_ID || '';
process.env.VUE_APP_LOGROCKET_CHILD_DOMAINS =
  process.env.LOGROCKET_CHILD_DOMAINS || '';
process.env.VUE_APP_URL_ACADEMY = process.env.VUE_APP_URL_ACADEMY || '';

module.exports = {
  devServer: {
    disableHostCheck: true,
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

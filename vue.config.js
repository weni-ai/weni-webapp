require('dotenv').config();
const CopyWebpackPlugin = require('copy-webpack-plugin');

process.env.VUE_APP_ROOT_API = (process.env.VUE_APP_ROOT_API || 'https://api-develop.weni.ai/');

process.env.VUE_APP_KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER;
process.env.VUE_APP_KEYCLOAK_AUTHORIZATION_ENDPOINT = process.env.KEYCLOAK_AUTHORIZATION_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_USERINFO_ENDPOINT = process.env.KEYCLOAK_USERINFO_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_END_SESSION_ENDPOINT = process.env.KEYCLOAK_END_SESSION_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_JWKS_URI = process.env.KEYCLOAK_JWKS_URI;
process.env.VUE_APP_KEYCLOAK_TOKEN_ENDPOINT = process.env.KEYCLOAK_TOKEN_ENDPOINT;
process.env.VUE_APP_KEYCLOAK_CHECK_SESSION_IFRAME = process.env.KEYCLOAK_CHECK_SESSION_IFRAME;
process.env.VUE_APP_KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
process.env.VUE_APP_SENTRY_DSN_ENDPOINT = process.env.SENTRY_DSN_ENDPOINT || '';

module.exports = {
  devServer: {
    disableHostCheck: true
  },
  lintOnSave:true,
  runtimeCompiler: true,
  outputDir: 'dist',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['css-loader', 
          {
            loader: 'vue-style-loader',
            options: {
              shadowMode: true
            }
          }]
        },
        {
          test: /\.scss$/,
          use: ['sass-loader']
        },
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
          {context:'public',to:'index.html',from:'index.html'},
          // {
          //   from: 'node_modules/fundamental-styles/dist',
          //   to: './fundamental-styles'
          // },
          {
            from: 'node_modules/@weni/unnnic-system/dist/img',
            to: './img'
          },
          {context:'node_modules/@weni/unnnic-system/dist',to:'unnnic.css',from:'unnnic.css'},
        ],
        {ignore:['.gitkeep','**/.DS_Store','**/Thumbs.db'],debug:'warning'}
      )]
    }
  };

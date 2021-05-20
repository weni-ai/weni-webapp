var path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'luigi-config.es6.js'),
    output: {
      path: path.resolve(__dirname, '../../public/assets'),
      filename: 'luigi-config.js'
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined,
        VUE_APP_ROOT_API: 'https://api-staging.weni.ai/',
        KEYCLOAK_URL: 'https://accounts.weni.ai/',
        KEYCLOAK_REALM: 'weni-staging',
        KEYCLOAK_CLIENT_ID: 'weni-webapp',
      }),
  ],
};
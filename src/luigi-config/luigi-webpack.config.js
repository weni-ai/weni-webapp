var path = require('path');
const webpack = require('webpack');

module.exports =  env => {
  return {
    mode: 'production',
    entry: path.resolve(__dirname, 'luigi-config.es6.js'),
    output: {
      path: path.resolve(__dirname, '../../public/assets'),
      filename: 'luigi-config.js'
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined,
        VUE_APP_ROOT_API: 'http://api-connect.push.al',
        KEYCLOAK_URL: 'http://keycloak-connect.push.al/',
        KEYCLOAK_REALM: 'ilhasoft',
        KEYCLOAK_CLIENT_ID: 'connect-frontend',
      }),
    ],
  };
};
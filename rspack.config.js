const { defineConfig } = require('@rspack/cli');
const { rspack } = require('@rspack/core');
const HtmlRspackPlugin = require('html-rspack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { resolve } = require('path');
const path = require('path');
const dotenv = require('dotenv');
const { dependencies } = require('./package.json');

dotenv.config();

const moduleFederationRemotes = {
  insights: process.env.MODULE_FEDERATION_INSIGHTS_URL,
  integrations: process.env.MODULE_FEDERATION_INTEGRATIONS_URL,
  bulk_send: process.env.MODULE_FEDERATION_BULK_SEND_URL,
  agent_builder: process.env.MODULE_FEDERATION_AGENT_BUILDER_URL,
};

const moduleFederationEnvVars = {
  insights: 'MODULE_FEDERATION_INSIGHTS_URL',
  integrations: 'MODULE_FEDERATION_INTEGRATIONS_URL',
  bulk_send: 'MODULE_FEDERATION_BULK_SEND_URL',
  agent_builder: 'MODULE_FEDERATION_AGENT_BUILDER_URL',
};

Object.entries(moduleFederationRemotes).forEach(([name, url]) => {
  if (!url) {
    console.warn(
      `[Module Federation] ${moduleFederationEnvVars[name]} is not set`,
    );
  }
});

function buildRemoteEntry(name, url) {
  if (!url) {
    return `${name}@${name}/remoteEntry.js`;
  }

  return `${name}@${url.replace(/\/+$/, '')}/remoteEntry.js`;
}

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'];

function formatEnv(env) {
  const newEnv = { ...env };

  if (newEnv.MODULES_YAML) {
    newEnv.MODULES_YAML = newEnv.MODULES_YAML.replaceAll('\\n', '\n');
  }

  return newEnv;
}

module.exports = defineConfig({
  context: __dirname,
  devServer: {
    historyApiFallback: true,
    hot: true,
    liveReload: false,
    compress: true,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: process.env.PUBLIC_PATH_URL,
    filename: 'assets/js/[name]-[contenthash].js',
    chunkFilename: 'assets/js/[name]-[contenthash].js',
    assetModuleFilename: 'assets/[name]-[hash][ext]',
  },
  entry: {
    main: './src/main.js',
  },
  resolve: {
    extensions: ['...', '.ts', 'js', '.vue'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.(scss|sass)$/,
        loader: 'sass-loader',
        type: 'css',
        options: {
          additionalData: `@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';`,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name]-[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './index.html',
      minify: {
        removeComments: false,
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeAttributeQuotes: false,
      },
    }),
    new rspack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      'process.env': JSON.stringify(formatEnv(process.env)),
      'import.meta.env': JSON.stringify({
        BASE_URL: '/',
      }),
    }),
    new VueLoaderPlugin(),
    new rspack.container.ModuleFederationPlugin({
      name: 'connect',
      remotes: {
        insights: buildRemoteEntry('insights', moduleFederationRemotes.insights),
        integrations: buildRemoteEntry(
          'integrations',
          moduleFederationRemotes.integrations,
        ),
        bulk_send: buildRemoteEntry(
          'bulk_send',
          moduleFederationRemotes.bulk_send,
        ),
        agent_builder: buildRemoteEntry(
          'agent_builder',
          moduleFederationRemotes.agent_builder,
        ),
      },
      exposes: {
        './sharedStore': './src/store/Shared.js',
      },
      shared: {
        vue: {
          eager: true,
          requiredVersion: '^3.0.0',
          singleton: true,
        },
        'vue-i18n': {
          singleton: true,
          requiredVersion: dependencies['vue-i18n'],
          eager: true,
        },
        pinia: {
          singleton: true,
          requiredVersion: dependencies['pinia'],
          eager: true,
        },
      },
      filename: 'remoteEntry.js',
    }),
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    css: true,
  },
});

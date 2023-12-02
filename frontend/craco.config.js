const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'production') {
        webpackConfig.devtool = false;
      }

      webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
        if (rule.oneOf) {
          return {
            ...rule,
            oneOf: rule.oneOf.map(oneOf => {
              if (oneOf.loader && oneOf.loader.includes('source-map-loader')) {
                return {
                  ...oneOf,
                  exclude: [
                    ...oneOf.exclude,
                    /@walletconnect/,
                    /eth-rpc-errors/,
                    /json-rpc-engine/,
                    /@metamask/,
                  ],
                };
              }
              return oneOf;
            }),
          };
        }
        return rule;
      });

      // Ваши существующие настройки resolve и plugins
      webpackConfig.resolve.fallback = {
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/')
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: require.resolve('process/browser'),
          Buffer: ['buffer', 'Buffer'],
        })
      );

      return webpackConfig;
    },
  },
};

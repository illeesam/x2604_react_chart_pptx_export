const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      // node: URI 스킴을 빈 모듈로 처리 (pptxgenjs 브라우저 번들용)
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        zlib: false,
        os: false,
      };

      // node: 스킴 처리를 위한 플러그인
      config.plugins = [
        ...(config.plugins || []),
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
      ];

      return config;
    },
  },
};

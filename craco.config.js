const webpack = require('webpack');

module.exports = {
  // CRA는 기본적으로 postcss.config.js를 무시(config: false)하고, tailwind.config.js가 없으면
  // Tailwind PostCSS도 넣지 않음 → Tailwind v4(@import + postcss.config.js)가 dev/build 모두 스킵됨.
  // mode: 'file' 로 인라인 플러그인을 제거해 postcss-load-config가 루트 postcss.config.js를 쓰게 함.
  style: {
    postcss: {
      mode: 'file',
    },
  },
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

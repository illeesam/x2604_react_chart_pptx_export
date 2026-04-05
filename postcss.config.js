// CRA inline PostCSS를 쓰지 않을 때는 flexbugs / preset-env를 여기서 맞춰 줌 (tailwind 분기와 동일)
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('postcss-flexbugs-fixes'),
    [
      require('postcss-preset-env'),
      {
        autoprefixer: { flexbox: 'no-2009' },
        stage: 3,
      },
    ],
  ],
};

export default {
  plugins: {
    tailwindcss: {},
    'postcss-color-functional-notation': {
      preserve: false,
    },
    autoprefixer: {
      overrideBrowserslist: [
        'Chrome >= 60',
        'Safari >= 11',
      ],
      grid: true,
    },
  },
}

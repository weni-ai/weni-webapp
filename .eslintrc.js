module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@weni/eslint-config/vue3'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'import/extensions': 'off',
    'no-shadow': 'off',
  },
  globals: { _: true, WebChat: true },
  overrides: [
    {
      files: ['**/*.spec.js', '**/tests/unit/**/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};

module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'script',
  },
  rules: {
    'no-underscore-dangle': 'off',
    camelcase: 'off',
  },
};

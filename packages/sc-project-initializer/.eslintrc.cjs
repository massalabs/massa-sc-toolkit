module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['@massalabs'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'tsdoc/syntax': 'warn',
    'max-len': ['error', 200],
    camelcase: 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};

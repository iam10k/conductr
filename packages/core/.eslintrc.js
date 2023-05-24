module.exports = {
  extends: '../../.eslintrc.js',
  rules: {
    '@typescript-eslint/ban-types': ['error', { types: { Function: false } }]
  }
};

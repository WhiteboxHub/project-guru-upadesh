module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.next/', 'coverage/'],
};

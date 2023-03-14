module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.json',
      './tsconfig.esm.json',
    ],
  },
  extends: [
    'airbnb',
    'airbnb-typescript/base',
    'plugin:require-extensions/recommended',
  ],
  settings: {
    react: {
      version: '999',
    },
  },
  rules: {
  },
};

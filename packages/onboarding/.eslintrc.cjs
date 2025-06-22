module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
  },
  extends: [
    "airbnb",
    "airbnb-typescript/base",
    "plugin:require-extensions/recommended",
  ],
  settings: {
    react: {
      version: "999",
    },
  },
  rules: {
    "@typescript-eslint/quotes": ["error", "double"],
    "import/prefer-default-export": "off",
    "import/extensions": "off",
    "class-methods-use-this": "off",
    "no-underscore-dangle": "off",
    "no-console": "off",
    "no-promise-executor-return": "off", // TODO: Remove 
  },
};

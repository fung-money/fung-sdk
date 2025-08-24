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
    indent: "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/comma-dangle": "off",
    "operator-linebreak": "off",
    "max-len": [
      "warn",
      {
        code: 140,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      },
    ],
    "no-nested-ternary": "off",
    "implicit-arrow-linebreak": "off",
    "function-paren-newline": "off",
    "object-curly-newline": "off",
    "react/jsx-wrap-multilines": "off",
    "multiline-ternary": "off",
    "no-extra-parens": "off",
    "react/jsx-one-expression-per-line": "off",
    "no-confusing-arrow": "off",
  },
  ignorePatterns: [".eslintrc.cjs"],
};

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['warn'],
      'no-param-reassign': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      quotes: ['error', 'single'],
      'no-console': 'off',
      'no-trailing-spaces': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      semi: ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      camelcase: ['error'],
      'no-duplicate-imports': 'error',
      'no-process-env': 'off',
    },
  },
];

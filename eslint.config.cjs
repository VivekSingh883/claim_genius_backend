const vue = require('eslint-plugin-vue');
const tsParser = require('@typescript-eslint/parser');
const vueParser = require('vue-eslint-parser');
const { defineFlatConfig } = require('eslint-define-config');

module.exports = defineFlatConfig([
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'auto-imports.d.ts',
      'components.d.ts',
      'env.d.ts',
      'typed-router.d.ts',
      'axios.ts',
      '**/*.d.ts',
    ],
  },
  // Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      vue,
    },
    rules: {
      'vue/no-unused-vars': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },
  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {},
  },
]);

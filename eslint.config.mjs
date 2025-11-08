// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';

export default [
  // Put global ignores in their own config block
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '*.db', '*.db-*']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // CJS
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest
      }
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_'
      }
  ],
    }
  }
];

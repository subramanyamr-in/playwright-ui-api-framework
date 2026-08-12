import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import customESLintRules from './src/helper/eslint-custom-rules/index.mjs';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'reports/**',
      'output/**',
      'temp/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      js,
      playwright,
      'custom-eslint-rules': customESLintRules,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'custom-eslint-rules/validate-playwright-priority-tags': 'error',
      'custom-eslint-rules/prevent-duplicate-titles': 'error',
    },
    settings: {
      playwright: {
        messages: {
          noFocusedTest:
            '⚠️ Do not commit "test.only". Remove it before pushing to prevent CI pipeline blockage.',
          noSkippedTest:
            '⚠️ Do not commit "test.skip". Remove it before pushing to prevent CI pipeline blockage.',
        },
      },
    },
  },
  eslintConfigPrettier,
];

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  // Next.js, React, React Hooks, and Core Web Vitals rules
  ...nextVitals,

  // Standard TypeScript rules recommended by Next.js
  ...nextTypeScript,

  // Stricter rules that use TypeScript type information
  {
    files: ['**/*.{ts,tsx}'],

    extends: [tseslint.configs.strictTypeChecked],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    rules: {
      // Prevent explicitly bypassing TypeScript
      '@typescript-eslint/no-explicit-any': 'error',

      // Allow intentionally unused names when prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prefer import type for type-only imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // Require promises to be awaited, returned, or explicitly ignored
      '@typescript-eslint/no-floating-promises': 'error',

      // Detect unsafe use of promises in callbacks and conditions
      '@typescript-eslint/no-misused-promises': 'error',

      // Detect awaiting non-promise values
      '@typescript-eslint/await-thenable': 'error',

      // Require complete handling of union types in switch statements
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
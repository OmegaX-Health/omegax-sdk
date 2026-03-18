import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const nodeGlobals = {
  ...globals.node,
};

export default [
  {
    ignores: ['artifacts/**', 'dist/**', 'node_modules/**'],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.mjs'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      ...config.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      ...config.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  })),
];

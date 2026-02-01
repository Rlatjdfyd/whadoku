import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier'; // Import the plugin
import eslintConfigPrettier from 'eslint-config-prettier'; // Import the config

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
      prettier: eslintPluginPrettier, // Add Prettier plugin
    },
    extends: [
      'js/recommended',
      eslintConfigPrettier, // Use Prettier config
    ],
    rules: {
      'prettier/prettier': 'error', // Enable the Prettier rule
    },
    languageOptions: { globals: globals.browser },
  },
]);

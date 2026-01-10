/* eslint-disable import/no-anonymous-default-export */
import globals from 'globals';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  { languageOptions: { globals: globals.browser } },
  ...compat.extends('airbnb'),
  {
    rules: {
      'no-console': 'warn', // Warns about console.log usage
      'no-unused-vars': 'warn', // Warns about unused variables
      indent: ['warn', 2], // Enforces a 2-space indentation
      quotes: ['warn', 'single'], // Enforces single quotes
      semi: ['warn', 'always'], // Enforces semicolons at the end of statements
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'linebreak-style': 'off', // Turn off linebreak-style rule
      'import/extensions': 'off', // Disable the import/extensions rule
      namedComponents: 'arrow-function', // or 'function-declaration' or 'function-expression'
      unnamedComponents: 'arrow-function', // or 'function-declaration' or 'function-expression'
    },
  },
];

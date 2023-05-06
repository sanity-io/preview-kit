const { readGitignoreFiles } = require('eslint-gitignore')

module.exports = {
  root: true,
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
  settings: { react: { version: 'detect' } },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'simple-import-sort',
    'prettier',
  ],
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'no-console': 'error',
    'no-warning-comments': [
      'warn',
      { location: 'start', terms: ['todo', '@todo', 'fixme'] },
    ],
    'react/prop-types': 'off',
    'prettier/prettier': 'warn',
  },
}

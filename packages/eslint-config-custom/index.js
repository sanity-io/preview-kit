const { readGitignoreFiles } = require('eslint-gitignore')

module.exports = {
  ignorePatterns: readGitignoreFiles(),
  plugins: ['prettier', 'simple-import-sort'],
  extends: [
    'sanity/react',
    'sanity/typescript',
    '@sanity/eslint-config-studio',
    'next/core-web-vitals',
    'turbo',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'react-hooks/exhaustive-deps': 'error',
  },
}

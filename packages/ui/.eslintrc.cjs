const { readGitignoreFiles } = require('eslint-gitignore')

module.exports = {
  root: true,
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
  plugins: ['prettier', 'simple-import-sort'],
  extends: [
    'sanity/react',
    'sanity/typescript',
    '@sanity/eslint-config-studio',
    'plugin:@next/next/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'react-hooks/exhaustive-deps': 'error',
    '@next/next/no-html-link-for-pages': 'off',
  },
}

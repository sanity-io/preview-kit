import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  legacyExports: true,
  bundles: [
    {
      source: './src/_exports/internals/_create-conditional-live-query.ts',
      import: './dist/internals/create-conditional-live-query.js',
      runtime: 'node',
    },
    {
      source: './src/_exports/internals/_live-query.ts',
      import: './dist/internals/live-query.js',
      runtime: 'node',
    },
  ],
  extract: {
    rules: {
      'ae-forgotten-export': 'warn',
      'ae-incompatible-release-tags': 'warn',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'warn',
    },
  },
})

import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  legacyExports: true,
  extract: {
    rules: {
      'ae-forgotten-export': 'error',
      'ae-missing-release-tag': 'error',
    },
  },
})

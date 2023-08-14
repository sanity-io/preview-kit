import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  legacyExports: true,
  preserveModuleDirectives: true,
  extract: {
    rules: {
      'ae-missing-release-tag': 'off',
      'ae-internal-missing-underscore': 'off',
    },
  },
})

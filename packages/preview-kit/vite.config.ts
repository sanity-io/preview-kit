// This is the default config, runs with Node.js globals and doesn't require `npm run build` before executing tests

import {configDefaults, defineConfig} from 'vitest/config'

import pkg from './package.json'

export default defineConfig({
  test: {
    // don't use vitest to run Bun and Deno tests
    exclude: [...configDefaults.exclude],
    // Allow switching test runs from using the source TS or compiled ESM
    alias: {
      '@sanity/preview-kit': new URL(pkg.exports['.'].source, import.meta.url).pathname,
    },
  },
})

import {defineConfig} from '@sanity/pkg-utils'

const MODULE_PATHES_WHICH_USE_CLIENT_DIRECTIVE_SHOULD_BE_ADDED = [
  'src/live-query/client-component/index.ts',
]

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  minify: true,
  rollup: {
    output: {
      banner: (chunkInfo) => {
        if (
          chunkInfo.isEntry &&
          MODULE_PATHES_WHICH_USE_CLIENT_DIRECTIVE_SHOULD_BE_ADDED.find((modulePath) =>
            chunkInfo.facadeModuleId?.endsWith(modulePath),
          )
        ) {
          return `"use client"`
        }
        return ''
      },
    },
  },
  extract: {
    rules: {
      'ae-forgotten-export': 'error',
      'ae-incompatible-release-tags': 'warn',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'warn',
    },
  },
})

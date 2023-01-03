import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  // eslint-disable-next-line no-warning-comments
  // @TODO turn minify back on once it stops removing 'use client'
  minify: false,

  rollup: {
    plugins: [
      {
        name: 'use client',
        banner: `'use client';`,
      },
    ],
  },

  tsconfig: 'tsconfig.build.json',
})

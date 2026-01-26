import {groqdPlaygroundTool} from 'groqd-playground'

import {visionTool} from '@sanity/vision'
import {defineConfig, defineField, defineType} from 'sanity'
import {structureTool} from 'sanity/structure'
import {benchmarkTool} from './src/benchmark'
import {PerspectiveExample} from './src/perspective-example'
import {IframeOptions, Iframe} from 'sanity-plugin-iframe-pane'
import {defineLocations, presentationTool} from 'sanity/presentation'
import {vercelProtectionBypassTool} from '@sanity/vercel-protection-bypass'

const iframeOptions = {
  reload: {
    button: true,
  },
} satisfies Omit<IframeOptions, 'url'>

const iframes: [IframeOptions['url'], string][] = [
  'next-app-router',
  'next-pages-router',
  'remix',
].map((title) => [
  (document, {perspectiveStack, selectedPerspectiveName}) => {
    const url = new URL(
      title === 'remix'
        ? process.env.SANITY_STUDIO_REMIX_URL || 'http://localhost:3000'
        : title === 'next-pages-router'
          ? process.env.SANITY_STUDIO_PAGES_ROUTER_URL || 'http://localhost:3003'
          : title === 'next-app-router'
            ? process.env.SANITY_STUDIO_APP_ROUTER_URL || 'http://localhost:3002'
            : 'https://example.com',
    )
    if (perspectiveStack.length > 0) {
      url.searchParams.set('sanity-preview-perspective', perspectiveStack.join(','))
    } else if (typeof selectedPerspectiveName === 'string') {
      url.searchParams.set('sanity-preview-perspective', selectedPerspectiveName)
    }
    return url.toString()
  },
  title,
])

export default defineConfig({
  announcements: {enabled: false},
  comments: {enabled: false},
  scheduledPublishing: {enabled: false},
  tasks: {enabled: false},
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'pv8y60vp',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      defaultDocumentNode: (S, {schemaType}) => {
        switch (schemaType) {
          case `page`:
            return S.document().views([
              S.view.form(),
              ...iframes.map(([url, title]) =>
                S.view
                  .component(Iframe)
                  .options({
                    ...iframeOptions,
                    key: title,
                    url,
                  } satisfies IframeOptions)
                  .title(title),
              ),
              S.view.component(PerspectiveExample).title('Perspective Example'),
            ])
          default:
            return S.document().views([S.view.form()])
        }
      },
    }),
    presentationTool({
      allowOrigins: [
        process.env.SANITY_STUDIO_REMIX_URL!,
        process.env.SANITY_STUDIO_PAGES_ROUTER_URL!,
        process.env.SANITY_STUDIO_APP_ROUTER_URL!,
        'https://preview-kit-*.sanity.dev',
        'http://localhost:*',
      ].filter(Boolean),
      previewUrl: {
        initial: process.env.SANITY_STUDIO_REMIX_URL || 'https://preview-kit-remix.sanity.dev/',
        previewMode: {enable: '/api/draft'},
      },
      resolve: {
        locations: {
          page: defineLocations({
            locations: [
              {title: 'App Router', href: 'https://preview-kit-next-app-router.sanity.dev/'},
              {title: 'Pages Router', href: 'https://preview-kit-next-pages-router.sanity.dev/'},
              {title: 'Remix', href: 'https://preview-kit-remix.sanity.dev/'},
            ],
          }),
        },
      },
    }),
    benchmarkTool(),
    visionTool(),
    groqdPlaygroundTool(),
    vercelProtectionBypassTool(),
  ],
  schema: {
    types: [
      defineType({
        name: 'page',
        title: 'Page',
        type: 'document' as const,
        fields: [
          defineField({
            name: 'title',
            type: 'string',
          }),
        ],
      }),
    ],
  },
})

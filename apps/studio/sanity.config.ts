import {groqdPlaygroundTool} from 'groqd-playground'

import {visionTool} from '@sanity/vision'
import {defineConfig, defineField, defineType} from 'sanity'
import {structureTool} from 'sanity/structure'
import {benchmarkTool} from './src/benchmark'
import {IframeOptions, Iframe} from 'sanity-plugin-iframe-pane'
import {presentationTool} from 'sanity/presentation'
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
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
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
            ])
          default:
            return S.document().views([S.view.form()])
        }
      },
    }),
    presentationTool({
      name: 'remix',
      previewUrl: {
        origin: process.env.SANITY_STUDIO_REMIX_URL || 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft',
        },
      },
    }),
    presentationTool({
      name: 'pages-router',
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PAGES_ROUTER_URL || 'http://localhost:3003',
        previewMode: {
          enable: '/api/draft',
        },
      },
    }),
    presentationTool({
      name: 'app-router',
      previewUrl: {
        origin: process.env.SANITY_STUDIO_APP_ROUTER_URL || 'http://localhost:3002',
        previewMode: {
          enable: '/api/draft',
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

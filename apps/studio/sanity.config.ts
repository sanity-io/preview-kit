import { groqdPlaygroundTool } from 'groqd-playground'

import { visionTool } from '@sanity/vision'
import { defineConfig, defineField, defineType } from 'sanity'
import { deskTool } from 'sanity/desk'
import { benchmarkTool } from './src/benchmark'
import { IframeOptions, Iframe } from 'sanity-plugin-iframe-pane'
import { presentationTool } from '@sanity/presentation'

const iframeOptions = {
  reload: {
    button: true,
  },
} satisfies Omit<IframeOptions, 'url'>

const iframes: [typeof Iframe, string, string][] = [
  'next-app-router',
  'next-pages-router',
  'remix',
  'next-app-router-groq-store',
  'next-pages-router-groq-store',
  'remix-groq-store',
  'next-app-router-live-store',
  'next-pages-router-live-store',
  'remix-live-store',
].map((title) => [
  Iframe.bind({}),
  `https://preview-kit-${title}.sanity.build`,
  title,
])

const config = defineConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  plugins: [
    deskTool({
      defaultDocumentNode: (S, { schemaType }) => {
        // Only show preview pane on `movie` schema type documents
        switch (schemaType) {
          case `page`:
            return S.document().views([
              S.view.form(),
              ...iframes.map(([IframeComponent, url, title]) =>
                S.view
                  .component(IframeComponent)
                  .options({ ...iframeOptions, url } satisfies IframeOptions)
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
        origin: process.env.SANITY_STUDIO_REMIX_URL || 'http://localhost:3002',
        draftMode: {
          enable: '/api/draft'
        }
      }
    }),
    presentationTool({
      name: 'pages-router',
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PAGES_ROUTER_URL || 'http://localhost:3000',
        draftMode: {
          enable: '/api/draft'
        }
      }
    }),
    presentationTool({
      name: 'app-router',
      previewUrl: {
        origin: process.env.SANITY_STUDIO_APP_ROUTER_URL || 'http://localhost:3001',
        draftMode: {
          enable: '/api/draft'
        }
      }
    }),
    benchmarkTool(),
    visionTool(),
    groqdPlaygroundTool(),
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

export default config

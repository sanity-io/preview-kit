import { groqdPlaygroundTool } from 'groqd-playground'

import { visionTool } from '@sanity/vision'
import { defineConfig, defineField, defineType,SanityDocumentLike } from 'sanity'
import { deskTool } from 'sanity/desk'
import { benchmarkTool } from './src/benchmark'
import { IframeOptions, Iframe } from 'sanity-plugin-iframe-pane'
import { createElement } from 'react'

const iframeOptions = {
  reload: {
    button: true,
    revision: true,
},
} satisfies Omit<IframeOptions, 'url'>

let defineGetPreviewUrl = (base: string) => function getPreviewUrl(doc: SanityDocumentLike) {
  const url = new URL(base)
  if(doc?._rev) {
    url.searchParams.set('rev', doc._rev)
  }
  return url.toString()
}


const config = defineConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  plugins: [deskTool({defaultDocumentNode: (S, {schemaType}) => {
    // Only show preview pane on `movie` schema type documents
    switch (schemaType) {
      case `page`:
        return S.document().views([
          S.view.form(),
          S.view
            .component(props => createElement(Iframe, {...props, key: 'next-app-router'}))
            .options({
              ...iframeOptions,
              url: defineGetPreviewUrl('https://preview-kit-next-app-router.sanity.build/api/draft'),
            } satisfies IframeOptions)
            .title('next-app-router'),
            S.view
            .component(props => createElement(Iframe, {...props, key: 'next-pages-router'}))
            .options({
              ...iframeOptions,
              url: defineGetPreviewUrl('https://preview-kit-next-pages-router.sanity.build/api/draft'),
            } satisfies IframeOptions)
            .title('next-pages-router'),
            S.view
            .component(props => createElement(Iframe, {...props, key: 'remix'}))
            .options({
              ...iframeOptions,
              url: defineGetPreviewUrl('https://preview-kit-remix.sanity.build/api/preview'),
            } satisfies IframeOptions)
            .title('remix'),
        ])
      default:
        return S.document().views([S.view.form()])
    }
  }}), benchmarkTool(), visionTool(), groqdPlaygroundTool()],
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

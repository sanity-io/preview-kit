import { visionTool } from '@sanity/vision'
import { defineConfig, defineField, defineType } from 'sanity'
import { deskTool } from 'sanity/desk'

const config = defineConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  plugins: [deskTool(), visionTool()],
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

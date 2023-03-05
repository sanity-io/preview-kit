import { visionTool } from '@sanity/vision'
import { defineConfig, defineField, defineType, Studio } from 'sanity'
import { deskTool } from 'sanity/desk'

const config = defineConfig({
  projectId: 'pv8y60vp',
  dataset: 'production',
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

export default function App() {
  return <Studio config={config} />
}

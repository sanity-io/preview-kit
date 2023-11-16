import { createClient } from '@sanity/preview-kit/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2022-11-15',
  useCdn: false,
  studioUrl: process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:3333',
  logger: console,
  encodeSourceMap: true,
  perspective: 'published',
})

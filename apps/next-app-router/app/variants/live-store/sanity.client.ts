import {createClient} from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-03-04',
  useCdn: false,
  perspective: 'published',
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:3333',
    logger: console,
  },
})

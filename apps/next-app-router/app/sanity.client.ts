import {createClient} from '@sanity/preview-kit/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-03-04',
  useCdn: false,
  perspective: 'published',
  stega: {
    enabled: true,
    studioUrl: 'https://preview-kit-test-studio.sanity.dev',
    logger: console,
  },
})

import {createClient} from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'X',
  useCdn: false,
  perspective: 'published',
  stega: {
    enabled: true,
    studioUrl: 'https://preview-kit-test-studio.sanity.dev',
    logger: console,
  },
})

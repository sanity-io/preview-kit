import { createClient, type SanityClient } from '@sanity/preview-kit/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2022-11-15'
const useCdn = false

export type { SanityClient }

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: 'https://preview-kit-test-studio.sanity.build/',
  encodeSourceMapAtPath: () => true,
})

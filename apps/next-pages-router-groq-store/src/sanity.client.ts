import { createClient, type SanityClient } from '@sanity/preview-kit/client'
import { apiVersion, dataset, projectId, useCdn } from './sanity.env'

export type { SanityClient }

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: 'https://preview-kit-test-studio.sanity.build/',
  encodeSourceMapAtPath: () => true,
})

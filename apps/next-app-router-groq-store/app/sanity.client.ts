import { createClient, type SanityClient } from '@sanity/preview-kit/client'
import { apiVersion, dataset, projectId, useCdn, token } from './sanity.env'

export type { SanityClient }

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: 'https://preview-kit-test-studio.sanity.build/',
  encodeSourceMapAtPath: () => true,
  token,
  perspective: 'published',
})

// Used to preview drafts as they will appear once published
export const draftsClient = sanityClient.withConfig({
  perspective: 'previewDrafts',
  // required by previewDrafts
  useCdn: false,
})

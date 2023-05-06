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

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
}
// Used to preview drafts as they will appear once published
export const draftsClient = sanityClient.withConfig({
  perspective: 'previewDrafts',
  // required by previewDrafts
  apiVersion: 'X',
  useCdn: false,
  token,
})

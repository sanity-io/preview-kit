import { createClient, type SanityClient } from '@sanity/preview-kit/client'
import { apiVersion, dataset, projectId, useCdn } from './sanity.env'

export type { SanityClient }

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: 'https://preview-kit-test-studio.sanity.build/',
  encodeSourceMap: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
  encodeSourceMapAtPath: () => true,
})

// Used to preview drafts as they will appear once published
export const draftsClient = sanityClient.withConfig({
  perspective: 'previewDrafts',
  // required by previewDrafts
  apiVersion: 'X',
  useCdn: false,
})

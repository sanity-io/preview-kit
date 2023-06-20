import { createClient, type SanityClient } from '@sanity/preview-kit/client'
import { apiVersion, dataset, projectId, useCdn } from './sanity.env'

export type { SanityClient }

export function getClient({
  preview = false,
  token = process.env.SANITY_API_READ_TOKEN,
}: {
  preview?: boolean
  token?: string
}): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    studioUrl: 'https://preview-kit-test-studio.sanity.build/',
    encodeSourceMapAtPath: () => true,
    token,
    perspective: 'published',
    ignoreBrowserTokenWarning: true,
  })

  if (preview) {
    if (!token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      perspective: 'previewDrafts',
      useCdn: false,
    })
  }

  return client
}

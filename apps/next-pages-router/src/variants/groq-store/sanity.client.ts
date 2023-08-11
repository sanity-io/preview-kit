import { createClient, type SanityClient } from '@sanity/preview-kit/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2022-11-15'
const useCdn = false

export function getClient(preview?: { token: string }): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: 'published',
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      perspective: 'previewDrafts',
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
    })
  }
  return client
}
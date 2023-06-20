import { createClient } from '@sanity/preview-kit/client'
import { type SanityClient } from '@sanity/preview-kit/client'

const projectId = 'pv8y60vp'
const dataset = 'production'
const apiVersion = '2022-11-15'
const useCdn = true
const studioUrl = 'https://preview-kit-test-studio.sanity.build/'

export function getClient(preview?: { token: string }): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    studioUrl,
    logger: console,
    resultSourceMap: true,
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

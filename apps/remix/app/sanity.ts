import {createClient, type QueryParams} from '@sanity/preview-kit/client'

const projectId = 'pv8y60vp'
const dataset = 'production'
const apiVersion = '2022-11-15'
const useCdn = false
const studioUrl = process.env.STUDIO_URL || 'http://localhost:3333'
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl,
  logger: console,
  encodeSourceMap: true,
  perspective: 'published',
})

export const token = typeof process === 'undefined' ? '' : process.env.SANITY_API_READ_TOKEN!

const DEFAULT_PARAMS = {} as QueryParams
export async function sanityFetch<QueryResponse>({
  previewDrafts,
  query,
  params = DEFAULT_PARAMS,
}: {
  previewDrafts?: boolean
  query: string
  params?: QueryParams
}): Promise<QueryResponse> {
  if (previewDrafts && !token) {
    throw new Error('The `SANITY_API_READ_TOKEN` environment variable is required.')
  }
  return client.fetch<QueryResponse>(
    query,
    params,
    previewDrafts
      ? {
          token,
          perspective: 'previewDrafts',
        }
      : {},
  )
}

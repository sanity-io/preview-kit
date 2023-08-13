import { createClient, type QueryParams } from '@sanity/preview-kit/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2022-11-15'
const useCdn = false
const studioUrl = 'https://preview-kit-test-studio.sanity.build/'
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

export const token = process.env.SANITY_API_READ_TOKEN!

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
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    )
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

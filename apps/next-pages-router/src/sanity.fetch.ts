import type { QueryParams } from '@sanity/client'
import { client } from './sanity.client'

export const token = process.env.SANITY_API_READ_TOKEN!

const DEFAULT_PARAMS = {} as QueryParams

export async function sanityFetch<QueryResponse>({
  draftMode,
  query,
  params = DEFAULT_PARAMS,
}: {
  draftMode?: boolean
  query: string
  params?: QueryParams
}): Promise<QueryResponse> {
  if (draftMode && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    )
  }
  return client.fetch<QueryResponse>(query, params, draftMode ? {
    token,
    perspective: 'previewDrafts',
  } : {},
  )
}

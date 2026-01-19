import {type ClientPerspective, type QueryParams} from '@sanity/client'

export type QueryCacheKey = `${string}:${string}:${string}`

export function getQueryCacheKey(
  query: string,
  params: QueryParams,
  perspective?: Exclude<ClientPerspective, 'raw'>,
): QueryCacheKey {
  return `${query}:${perspective || 'default'}:${JSON.stringify(params)}`
}

import {type ClientPerspective, type QueryParams} from '@sanity/client'

/**
 * Cache key format: `query:{"params":...,"perspective":...}`
 * @internal
 */
export type QueryCacheKey = `${string}:${string}`

export function getQueryCacheKey(
  query: string,
  params: QueryParams,
  perspective: Exclude<ClientPerspective, 'raw'>,
): QueryCacheKey {
  return `${query}:${JSON.stringify({params, perspective})}`
}

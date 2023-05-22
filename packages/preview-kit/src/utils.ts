import type { QueryParams } from '@sanity/client'

/**
 * @internal
 */
export type QueryCacheKey = `${string}-${string}`
/**
 * @internal
 */
export function getQueryCacheKey(
  query: string,
  params: QueryParams
): QueryCacheKey {
  return `${query}-${JSON.stringify(params)}`
}

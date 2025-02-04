import {type QueryParams} from '@sanity/client'

export type QueryCacheKey = `${string}:${string}`

export function getQueryCacheKey(query: string, params: QueryParams): QueryCacheKey {
  return `${query}:${JSON.stringify(params)}`
}

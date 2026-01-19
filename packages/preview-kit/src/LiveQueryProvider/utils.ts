import {type QueryParams} from '@sanity/client'

import type {ValidPerspective} from '../types'

export type QueryCacheKey = `${string}:${string}:${string}`

const DEFAULT_PERSPECTIVE = 'default'

export function getQueryCacheKey(
  query: string,
  params: QueryParams,
  perspective?: ValidPerspective,
): QueryCacheKey {
  return `${query}:${perspective || DEFAULT_PERSPECTIVE}:${JSON.stringify(params)}`
}

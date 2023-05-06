import type { QueryParams } from '@sanity/client'
import { createContext } from 'react'

/**
 * @internal
 */
export interface StoreContext {
  defineSubscribe: <Snapshot>(
    initialSnapshot: Snapshot,
    query: string,
    params: QueryParams
  ) => (onStoreChange: () => void) => () => void
  defineGetSnapshot: <Snapshot>(
    query: string,
    params: QueryParams
  ) => () => Snapshot
}

/**
 * @internal
 */
export const storeContext = createContext<StoreContext | null>(null)

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

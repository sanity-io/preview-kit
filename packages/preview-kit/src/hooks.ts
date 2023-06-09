import type { QueryParams as ClientQueryParams } from '@sanity/client'
import {
  useCallback,
  useContext,
  useMemo,
  useState,
  useDeferredValue,
} from 'react'
import isFastEqual from 'react-fast-compare'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { defineListenerContext } from './context'

// Re-export types we use that are needed externally
export type { ClientQueryParams }

/**
 * By default 'react-fast-compare' is used to check if the query result has changed.
 * It's reasonably fast, but you can make it even faster by providing your own function as you know which
 * part of the query result is visible to the user, and which parts can skip rendering.
 * @public
 */
export type isEqualFn<QueryResult> = (a: QueryResult, b: QueryResult) => boolean

/** @public */
export interface ListeningQueryHookOptions<QueryResult> {
  isEqual?: isEqualFn<QueryResult>
}

/** @public 1 */
export function useListeningQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams
>(
  initialSnapshot: QueryResult,
  query: string,
  queryParams?: QueryParams,
  options?: ListeningQueryHookOptions<QueryResult>
  // isEqual: (a: QueryResult, b: QueryResult) => boolean = isFastEqual
): QueryResult {
  const { isEqual = isFastEqual } = options || {}

  const defineStore = useContext(defineListenerContext)
  const params = useParams(queryParams)
  const store = useMemo(
    () => defineStore<QueryResult>(initialSnapshot, query, params),
    [defineStore, initialSnapshot, params, query]
  )
  // initialSnapshot might change before hydration is done, so deep cloning it on the first hook call
  // helps ensure that we don't get a mismatch between the server and client snapshots
  const [serverSnapshot] = useState(() =>
    JSON.parse(JSON.stringify(initialSnapshot))
  )
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot])
  const selector = useCallback((snapshot: QueryResult) => snapshot, [])

  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
    selector,
    isEqual
  )
}

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
function useParams(
  params?: undefined | null | ClientQueryParams
): ClientQueryParams {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params]
  )
  return useMemo(() => JSON.parse(stringifiedParams), [stringifiedParams])
}

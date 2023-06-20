import type { QueryParams as ClientQueryParams } from '@sanity/client'
import { useCallback, useContext, useMemo, useState } from 'react'
import isFastEqual from 'react-fast-compare'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { defineListenerContext, LoadedListenersContext } from './context'
import type { ListenerStatus } from './types'
import { getQueryCacheKey } from './utils'

// Re-export types we use that are needed externally
export type { ClientQueryParams, ListenerStatus }

/**
 * By default 'react-fast-compare' is used to check if the query result has changed.
 * It's reasonably fast, but you can make it even faster by providing your own function as you know which
 * part of the query result is visible to the user, and which parts can skip rendering.
 * @public
 */
export type isEqualFn<QueryResult> = (a: QueryResult, b: QueryResult) => boolean

/** @public */
export interface LiveQueryHookOptions<QueryResult> {
  isEqual?: isEqualFn<QueryResult>
}

/** @public */
export type QueryLoading = boolean

/** @public */
export function useLiveQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams
>(
  initialData: QueryResult,
  query: string,
  queryParams?: QueryParams,
  options?: LiveQueryHookOptions<QueryResult>
): [QueryResult, QueryLoading] {
  const { isEqual = isFastEqual } = options || {}

  const defineStore = useContext(defineListenerContext)
  const params = useParams(queryParams)
  const store = useMemo(
    () => defineStore<QueryResult>(initialData, query, params),
    [defineStore, initialData, params, query]
  )
  // initialSnapshot might change before hydration is done, so deep cloning it on the first hook call
  // helps ensure that we don't get a mismatch between the server and client snapshots
  const [serverSnapshot] = useState(() => {
    if (initialData === undefined) {
      throw new Error(
        `initialSnapshot can't be undefined, if you don't want an initial value use null instead`
      )
    }
    try {
      return JSON.parse(JSON.stringify(initialData))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        "Failed to deep clone initialSnapshot, this is likely an error and an indication that the snapshot isn't JSON serializable",
        { initialSnapshot: initialData, error }
      )
      return initialData
    }
  })
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot])
  const selector = useCallback((snapshot: QueryResult) => snapshot, [])

  const snapshot = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
    selector,
    isEqual
  )
  const loading = useLiveQueryIsLoading(query, params)

  return [snapshot, loading]
}

/**
 * Wether a particular query is loading or not.
 * @public
 */
function useLiveQueryIsLoading(
  query: string,
  params: ClientQueryParams
): QueryLoading {
  const loadedListeners = useContext(LoadedListenersContext)
  const key = useMemo(() => getQueryCacheKey(query, params), [params, query])

  return useMemo(() => {
    if (Array.isArray(loadedListeners)) {
      return loadedListeners.includes(key) ? false : true
    }
    return false
  }, [key, loadedListeners])
}

/**
 * @public
 * @deprecated use `LiveQueryHookOptions` instead
 */
export interface ListeningQueryHookOptions<QueryResult> {
  isEqual?: isEqualFn<QueryResult>
}

/**
 * @public
 * @deprecated use `useLiveQuery` instead
 */
export function useListeningQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams
>(
  initialSnapshot: QueryResult,
  query: string,
  queryParams?: QueryParams,
  options?: ListeningQueryHookOptions<QueryResult>
): QueryResult {
  const [snapshot] = useLiveQuery<QueryResult, QueryParams>(
    initialSnapshot,
    query,
    queryParams,
    options
  )
  return snapshot
}

/**
 * Wether a particular query is loading or not.
 * @public
 * @deprecated use `useLiveQuery` instead
 */
export function useListeningQueryStatus<
  QueryParams extends ClientQueryParams = ClientQueryParams
>(query: string, queryParams?: QueryParams): ListenerStatus {
  const params = useParams(queryParams)
  const loading = useLiveQueryIsLoading(query, params)

  return loading ? 'loading' : 'success'
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

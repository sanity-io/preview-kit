import type {QueryParams as ClientQueryParams, QueryParams} from '@sanity/client'
import {useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore} from 'react'
import isFastEqual from 'react-fast-compare'
import {useSyncExternalStoreWithSelector} from 'use-sync-external-store/with-selector'

import {defineStoreContext} from './context'
import type {ListenerGetSnapshot, ListenerSubscribe, QueryEnabled, QueryLoading} from './types'

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
export function useLiveQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
>(
  initialData: QueryResult,
  query: string,
  queryParams?: QueryParams,
  options?: LiveQueryHookOptions<QueryResult>,
): [QueryResult, QueryLoading, QueryEnabled] {
  const {isEqual = isFastEqual} = options || {}

  const defineStore = useContext(defineStoreContext)
  const params = useQueryParams(queryParams)
  const noStore = useMemo(
    () => ({
      subscribe: (() => () => {}) satisfies ListenerSubscribe,
      getSnapshot: () => initialData,
    }),
    [initialData],
  )
  const store = useMemo<
    | {
        subscribe: ListenerSubscribe
        getSnapshot: ListenerGetSnapshot<QueryResult>
      }
    | undefined
  >(
    () =>
      defineStore?.<QueryResult>(initialData, query, params) || {
        subscribe: (() => () => {}) satisfies ListenerSubscribe,
        getSnapshot: () => initialData,
      },
    [defineStore, initialData, params, query],
  )
  // initialSnapshot might change before hydration is done, so deep cloning it on the first hook call
  // helps ensure that we don't get a mismatch between the server and client snapshots
  const [serverSnapshot] = useState(() => {
    if (initialData === undefined) {
      throw new Error(
        `initialSnapshot can't be undefined, if you don't want an initial value use null instead`,
      )
    }
    try {
      return JSON.parse(JSON.stringify(initialData))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        "Failed to deep clone initialSnapshot, this is likely an error and an indication that the snapshot isn't JSON serializable",
        {initialSnapshot: initialData, error},
      )
      return initialData
    }
  })
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot])
  const selector = useCallback((snapshot: QueryResult) => snapshot, [])

  const snapshot = useSyncExternalStoreWithSelector(
    store?.subscribe || noStore.subscribe,
    store?.getSnapshot || noStore.getSnapshot,
    getServerSnapshot,
    selector,
    isEqual,
  )
  const enabled = defineStore !== null
  const loading = enabled && serverSnapshot === snapshot

  return [snapshot, loading, enabled]
}

/**
 * The `useLiveQuery` hook is designed to work in environments where the parent `LiveQueryProvider` may be lazy loaded.
 * Thus if it can't "know" if it's "live" or not, or of it will be later. When everything is setup correctly this is fine.
 * This hook on the other hand does know. If it returns `false` then sibling `useLiveQuery` hooks are not "live".
 * If it returns `true` then sibling `useLiveQuery` hooks are "live" as there is a parent `LiveQueryProvider` in the tree that is loaded and active.
 * @public
 * @deprecated use `useLiveQuery` instead: `const [,,enabled] = useLiveQuery(initialData, query, params)`
 */
export function useIsEnabled(): boolean {
  return useContext(defineStoreContext) !== null
}

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
export function useQueryParams(params?: undefined | null | QueryParams): QueryParams {
  const stringifiedParams = useMemo(() => JSON.stringify(params || {}), [params])
  return useMemo(() => JSON.parse(stringifiedParams) as QueryParams, [stringifiedParams])
}

/**
 * Keeps track of when revalidation and activities should be paused
 */
export function useShouldPause(): boolean {
  const [online, setOnline] = useState(false)
  useEffect(() => {
    setOnline(navigator.onLine)
    const online = () => setOnline(true)
    const offline = () => setOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])
  const visibilityState = useSyncExternalStore(
    onVisibilityChange,
    () => document.visibilityState,
    () => 'hidden' satisfies DocumentVisibilityState,
  )

  // Should pause activity when offline
  if (!online) {
    return true
  }

  // Should pause when the document isn't visible, as it's likely the user isn't looking at the page
  if (visibilityState === 'hidden') {
    return true
  }

  return false
}

function onVisibilityChange(onStoreChange: () => void): () => void {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

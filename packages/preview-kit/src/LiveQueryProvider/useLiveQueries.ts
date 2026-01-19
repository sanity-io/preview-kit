import {type ContentSourceMap, type QueryParams, type SyncTag} from '@sanity/client'
import {useCallback, useReducer, useState} from 'react'
import isEqual from 'react-fast-compare'

import type {ValidPerspective} from '../types'
import {getQueryCacheKey, type QueryCacheKey} from './utils'

export type OnStoreChange = () => void

type LiveQueriesState = Map<
  QueryCacheKey,
  {
    query: string
    params: QueryParams
    perspective: ValidPerspective | undefined
    listeners: Set<OnStoreChange>
  }
>

export type LiveSnapshots = Map<
  QueryCacheKey,
  {
    result: unknown
    resultSourceMap: ContentSourceMap | null | undefined
    syncTags: SyncTag[] | undefined
  }
>

type SubscribeAction = {
  type: 'subscribe'
  payload: {
    query: string
    params: QueryParams
    perspective: ValidPerspective | undefined
    onStoreChange: OnStoreChange
  }
}
type UnsubscribeAction = {
  type: 'unsubscribe'
  payload: {
    query: string
    params: QueryParams
    perspective: ValidPerspective | undefined
    onStoreChange: OnStoreChange
  }
}
export type SnapshotAction = {
  type: 'snapshot'
  payload: {
    query: string
    params: QueryParams
    result: unknown
    resultSourceMap: ContentSourceMap | undefined
    perspective: ValidPerspective
    tags: `s1:${string}`[] | undefined
  }
}
type Action = SubscribeAction | UnsubscribeAction | SnapshotAction

function subscribe(queries: LiveQueriesState, {payload}: SubscribeAction): LiveQueriesState {
  const key = getQueryCacheKey(payload.query, payload.params, payload.perspective)

  if (!queries.get(key)?.listeners.has(payload.onStoreChange)) {
    const nextQueries = new Map(queries)
    const value = nextQueries.get(key) || {
      query: payload.query,
      params: payload.params,
      perspective: payload.perspective,
      listeners: new Set(),
    }
    const listeners = new Set(value.listeners)
    listeners.add(payload.onStoreChange)
    nextQueries.set(key, {...value, listeners})
    return nextQueries
  }

  return queries
}

function unsubscribe(queries: LiveQueriesState, {payload}: UnsubscribeAction): LiveQueriesState {
  const key = getQueryCacheKey(payload.query, payload.params, payload.perspective)

  const value = queries.get(key)
  if (!value) {
    return queries
  }
  if (!value.listeners.has(payload.onStoreChange)) {
    return queries
  }
  const nextQueries = new Map(queries)
  const listeners = new Set(value.listeners)
  listeners.delete(payload.onStoreChange)
  if (listeners.size === 0) {
    nextQueries.delete(key)
  } else {
    nextQueries.set(key, {...value, listeners})
  }
  return nextQueries
}

export function reducer(state: LiveQueriesState, action: Action): LiveQueriesState {
  switch (action.type) {
    case 'subscribe':
      return subscribe(state, action)
    case 'unsubscribe':
      return unsubscribe(state, action)
    default:
      throw Error(
        `Unknown action: ${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (action as any).type
        }`,
        {cause: action},
      )
  }
}

export const initialQueries: LiveQueriesState = new Map()

export type LiveQueriesDispatch = React.Dispatch<Action>

export type LiveQueriesUpdate = (
  key: QueryCacheKey,
  result: unknown,
  resultSourceMap: ContentSourceMap | null | undefined,
  syncTags: SyncTag[] | undefined,
) => boolean

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useLiveQueries() {
  const [queries, dispatch] = useReducer(reducer, initialQueries)
  const [snapshots] = useState<LiveSnapshots>(() => new Map())

  const subscribe = useCallback((payload: SubscribeAction['payload']): (() => void) => {
    dispatch({type: 'subscribe', payload})
    return () => dispatch({type: 'unsubscribe', payload})
  }, [])
  /**
   * This handler is intentionally mutating the snapshots state, this is so that useSyncExternalStore hooks
   * can read the current state in its getSnapshot handlers.
   * The caller is responsible for looping over listeners in order to notify the stores.
   */
  const update = useCallback<LiveQueriesUpdate>(
    (key, result, resultSourceMap, syncTags) => {
      const prev = snapshots.get(key)
      if (prev && isEqual(prev, {result, resultSourceMap, syncTags})) {
        return false
      }
      snapshots.set(key, {
        result: isEqual(prev?.result, result) ? prev?.result : result,
        resultSourceMap: isEqual(prev?.resultSourceMap, resultSourceMap)
          ? prev?.resultSourceMap
          : resultSourceMap,
        syncTags: isEqual(prev?.syncTags, syncTags) ? prev?.syncTags : syncTags,
      })

      return true
    },
    [snapshots],
  )

  return {queries, snapshots, subscribe, update}
}

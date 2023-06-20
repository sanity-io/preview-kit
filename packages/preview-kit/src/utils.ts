import type { QueryParams } from '@sanity/client'
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'

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

/**
 * @internal
 */
export function useLoadingListenersContext(
  ready: Set<QueryCacheKey>
): [QueryCacheKey[], () => void] {
  const [tick, forceUpdate] = useReducer((x) => x + 1, 0)
  const mountedRef = useRef(true)
  const scheduleUpdate = useCallback(() => {
    if (mountedRef.current) {
      startTransition(() => forceUpdate())
    }
  }, [])
  useEffect(() => {
    mountedRef.current = true
    scheduleUpdate()
    return () => {
      mountedRef.current = false
    }
  }, [scheduleUpdate])
  const loadedListenersContext = useMemo(
    () => (tick ? [...ready] : []),
    [ready, tick]
  )

  return [loadedListenersContext, scheduleUpdate]
}

export const DEFAULT_MAX_DOCUMENTS = 3000

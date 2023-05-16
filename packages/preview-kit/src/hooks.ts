import type { QueryParams } from '@sanity/client'
import { useCallback, useContext, useMemo, useState } from 'react'
import isFastEqual from 'react-fast-compare'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { storeContext } from './context'

// Re-export types we use that are needed externally
export type { QueryParams }

/** @public */
export function useListeningQuery<Snapshot, Selection = Snapshot>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams: QueryParams = {},
  selector: (snapshot: Snapshot) => Selection = (snapshot) =>
    snapshot as unknown as Selection,
  isEqual: (a: Selection, b: Selection) => boolean = isFastEqual
): Selection {
  const store = useContext(storeContext)

  if (store === null) {
    throw new Error(
      'useQuerySubscription must be used within a <GroqStoreProvider /> or a <LiveStoreProvider />'
    )
  }

  // We don't care if the initial query result is stale, as it's only the initial, usually SSR hydrated, value anyway
  const [memoInitialSnapshot] = useState(() => initialSnapshot)
  const params = useParams(queryParams)
  const subscribe = useMemo(
    () => store.defineSubscribe<Snapshot>(memoInitialSnapshot, query, params),
    [memoInitialSnapshot, params, query, store]
  )
  const getSnapshot = useMemo(
    () => store.defineGetSnapshot<Snapshot>(query, params),
    [params, query, store]
  )
  const getServerSnapshot = useCallback(
    () => memoInitialSnapshot,
    [memoInitialSnapshot]
  )

  return useSyncExternalStoreWithSelector<Snapshot, Selection>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
    selector,
    isEqual
  )
}

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
function useParams(params?: undefined | null | QueryParams): QueryParams {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params]
  )
  return useMemo(() => JSON.parse(stringifiedParams), [stringifiedParams])
}

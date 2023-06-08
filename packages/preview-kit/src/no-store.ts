// This is the default, fallback store, that allows using useListeningQuery without a provider.
import type { QueryParams } from '@sanity/client'

import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
} from './types'
import { getQueryCacheKey, type QueryCacheKey } from './utils'

const snapshots = new Map<QueryCacheKey, unknown>()
const deps = new Map<QueryCacheKey, number>()

/**
 * @internal
 */
export const NoStoreContext = function defineListener<QueryResult>(
  initialSnapshot: QueryResult,
  query: string,
  params: QueryParams
) {
  const key = getQueryCacheKey(query, params)

  // Always update the snapshot, to ensure that we have the latest value
  snapshots.set(key, initialSnapshot)
  // Keep track of how many dependencies are using this query, so we can know when it's safe to cleanup
  if (!deps.has(key)) {
    deps.set(key, 0)
  }

  const subscribe: ListenerSubscribe = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    deps.set(key, deps.get(key)! + 1)

    return () => {
      // Bookkeeping on how many dependencies are using this query
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      deps.set(key, deps.get(key)! - 1)

      // If nothing cares about this snapshot, clean it up and free memory
      if (deps.get(key) === 0) {
        snapshots.delete(key)
      }
    }
  }
  const getSnapshot: ListenerGetSnapshot<QueryResult> = () =>
    snapshots.has(key) ? (snapshots.get(key) as QueryResult) : initialSnapshot

  return { subscribe, getSnapshot }
} satisfies DefineListenerContext

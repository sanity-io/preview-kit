import type {
  ClientConfig,
  ContentSourceMap,
  QueryParams,
  SanityClient,
  SanityDocument,
} from '@sanity/client'
import { vercelStegaSplit } from '@vercel/stega'
import get from 'lodash.get'
import { LRUCache } from 'lru-cache'
import { applyPatch } from 'mendoza'
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { parseNormalisedJsonPath } from '../client/jsonpath'
import { resolveMapping, walkMap } from '../client/sourcemap'
import { defineListenerContext as Context } from '../context'
import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
  Logger,
} from '../types'
import { getQueryCacheKey, type QueryCacheKey } from '../utils'

// Documents share the same cache even if there are nested providers, with a Least Recently Used (LRU) cache
const documentsCache = new LRUCache({
  // Max 500 documents in memory, no big deal if a document is evicted it just means the eventual consistency might take longer
  max: 500,
})

/**
 * @internal
 */
export interface LiveStoreProviderProps {
  children: React.ReactNode
  /**
   * The Sanity client to use for fetching data and listening to mutations.
   */
  client: SanityClient
  /**
   * How frequently queries should be refetched in the background to refresh the parts of queries that can't be source mapped.
   * Setting it to `0` will disable background refresh.
   * @defaultValue 10000
   */
  refreshInterval?: number
  /**
   * Listen to mutations on the documents used by your queries, and apply patches directly to the result.
   * Requires Content Source Maps to work.
   * @defaultValue true
   */
  turboSourceMap?: boolean
  logger?: Logger
}
/**
 * @internal
 */
export const LiveStoreProvider = memo(function LiveStoreProvider(
  props: LiveStoreProviderProps
) {
  const {
    children,
    client,
    refreshInterval = 10000,
    turboSourceMap = true,
    logger,
  } = props

  // Check if the client is configured to use Content Source Maps if turbo is enabled
  // It's wrapped inside `useMemo` so it doesn't call `client.config` more than it needs to, but unlike `useEffect` sooner rather than later
  useMemo(() => {
    if (turboSourceMap && !client.config().resultSourceMap) {
      logger?.error(
        'The client needs to be configured with `resultSourceMap: true` to enable turbo mode.`'
      )
    }
  }, [client, turboSourceMap, logger])

  const report = useMemo(() => {
    if (turboSourceMap && client.config().resultSourceMap) {
      return `Updates that can be traced using Content Source Maps will be applied in real-time. Other updates will be applied every ${refreshInterval}ms.`
    }
    return `Updates will be applied every ${refreshInterval}ms.`
  }, [client, refreshInterval, turboSourceMap])
  useEffect(() => {
    if (logger) {
      logger.log(
        `[@sanity/preview-kit]: With the current configuration you can expect that: ${report}`
      )
    }
  }, [logger, report])

  const [subscriptions, setSubscriptions] = useState<QueryCacheKey[]>([])
  const [snapshots] = useState<QuerySnapshotsCache>(() => new Map())
  const hooks = useHooks(setSubscriptions)
  const [context] = useState<DefineListenerContext>(() => {
    return function defineListener<QueryResult>(
      initialSnapshot: QueryResult,
      query: string,
      params: QueryParams
    ) {
      const key = getQueryCacheKey(query, params)

      // Warm up the cache by setting the initial snapshot, showing stale-while-revalidate
      if (!snapshots.has(key)) {
        snapshots.set(key, {
          result: initialSnapshot,
          resultSourceMap: {} as ContentSourceMap,
        })
      }

      const subscribe: ListenerSubscribe = (onStoreChange) => {
        const unsubscribe = hooks.subscribe(key, query, params, onStoreChange)

        return () => unsubscribe()
      }
      const getSnapshot: ListenerGetSnapshot<QueryResult> = () =>
        snapshots.get(key)?.result as unknown as QueryResult

      return { subscribe, getSnapshot }
    } satisfies DefineListenerContext
  })
  const [turboIds, setTurboIds] = useState<string[]>([])
  const turboIdsFromSourceMap = useCallback(
    (contentSourceMap: ContentSourceMap) => {
      if (!turboSourceMap) return
      // This handler only adds ids, on each query fetch. But that's ok since <Turbo /> purges ids that are unused
      const nextTurboIds = new Set<string>()
      if (contentSourceMap.documents?.length) {
        for (const { _id } of contentSourceMap.documents) {
          nextTurboIds.add(_id)
        }
      }
      startTransition(() =>
        setTurboIds((prevTurboIds) => {
          const mergedTurboIds = Array.from(
            new Set([...prevTurboIds, ...nextTurboIds])
          )
          if (
            JSON.stringify(mergedTurboIds.sort()) ===
            JSON.stringify(prevTurboIds.sort())
          ) {
            return prevTurboIds
          }
          return mergedTurboIds
        })
      )
    },
    [turboSourceMap]
  )

  return (
    <Context.Provider value={context}>
      {children}
      {turboSourceMap && (
        <Turbo
          cache={hooks.cache}
          client={client}
          setTurboIds={setTurboIds}
          snapshots={snapshots}
          turboIds={turboIds}
        />
      )}
      {subscriptions.map((key) => {
        if (!hooks.cache.has(key)) return null
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { query, params, listeners } = hooks.cache.get(key)!
        return (
          <QuerySubscription
            key={key}
            client={client}
            listeners={listeners}
            params={params}
            query={query}
            refreshInterval={refreshInterval}
            snapshots={snapshots}
            turboIdsFromSourceMap={turboIdsFromSourceMap}
          />
        )
      })}
    </Context.Provider>
  )
})

interface QuerySubscriptionProps
  extends Required<Pick<LiveStoreProviderProps, 'client' | 'refreshInterval'>> {
  query: string
  params: QueryParams
  listeners: Set<() => void>
  turboIdsFromSourceMap: (contentSourceMap: ContentSourceMap) => void
  snapshots: QuerySnapshotsCache
}
const QuerySubscription = memo(function QuerySubscription(
  props: QuerySubscriptionProps
) {
  const {
    client,
    refreshInterval,
    query,
    params,
    listeners,
    snapshots,
    turboIdsFromSourceMap,
  } = props
  const { projectId, dataset } = useMemo(() => {
    const { projectId, dataset } = client.config()
    return { projectId, dataset } as Required<
      Pick<ClientConfig, 'projectId' | 'dataset'>
    >
  }, [client])

  // Make sure any async errors bubble up to the nearest error boundary
  const [error, setError] = useState<unknown>(null)
  if (error) throw error

  const [revalidate, startRefresh] = useRevalidate({ refreshInterval })
  const shouldRefetch = revalidate === 'refresh' || revalidate === 'inflight'
  useEffect(() => {
    if (!shouldRefetch) {
      return
    }

    let fulfilled = false
    const controller = new AbortController()
    // eslint-disable-next-line no-inner-declarations
    async function effect() {
      const { signal } = controller
      const { result, resultSourceMap } = await client.fetch(query, params, {
        signal,
        filterResponse: false,
      })

      if (!signal.aborted) {
        snapshots.set(getQueryCacheKey(query, params), {
          result: turboChargeResultIfSourceMap(
            projectId,
            dataset,
            result,
            resultSourceMap
          ),
          resultSourceMap: resultSourceMap ?? ({} as ContentSourceMap),
        })

        if (resultSourceMap) {
          turboIdsFromSourceMap(resultSourceMap)
        }

        // Notify listeners that snapshots are updated
        for (const listener of listeners.values()) {
          listener()
        }
        fulfilled = true
      }
    }
    const onFinally = startRefresh()
    effect()
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error)
        }
      })
      .finally(onFinally)
    return () => {
      if (!fulfilled) {
        controller.abort()
      }
    }
  }, [
    client,
    dataset,
    listeners,
    params,
    projectId,
    query,
    shouldRefetch,
    snapshots,
    startRefresh,
    turboIdsFromSourceMap,
  ])

  return null
})

type QuerySnapshotsCache = Map<
  QueryCacheKey,
  { result: unknown; resultSourceMap: ContentSourceMap }
>

function getTurboCacheKey(
  projectId: string,
  dataset: string,
  _id: string
): `${string}-${string}-${string}` {
  return `${projectId}-${dataset}-${_id}`
}

function onVisibilityChange(onStoreChange: () => void): () => void {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

/**
 * Keeps track of when revalidation and activities should be paused
 */
function useShouldPause(): boolean {
  const [online, setOnline] = useState(false)
  useEffect(() => {
    setOnline(navigator.onLine)
    const online = () => startTransition(() => setOnline(true))
    const offline = () => startTransition(() => setOnline(false))
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
    () => 'hidden' satisfies DocumentVisibilityState
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

/**
 * 'hit' - the cache is fresh and valid
 * 'stale' - the cache should revalidate, but can't/shouldn't yet (offline, visibility = hidden)
 * 'refresh' - stale cache, and now is a great time to start refreshing
 * 'inflight' - refreshing cache, revalidate events should be ignored
 */
type RevalidateState = 'hit' | 'stale' | 'refresh' | 'inflight'
/**
 * Keeps track of when queries should revalidate
 */
function useRevalidate(
  props: Pick<LiveStoreProviderProps, 'refreshInterval'>
): [RevalidateState, () => () => void] {
  const { refreshInterval } = props

  const shouldPause = useShouldPause()
  const [state, setState] = useState<RevalidateState>('hit')

  // Keep track of indicators for when revalidation should be 'paused'
  // Like if we're currently offline, or the document isn't visible
  // Basically if 'stale' and all good we return 'refresh'

  // Next keep track of staleness itself. If we come back online, on a windows focus event
  // or on a refreshInterval timeout
  // Basically it controls if cache should be 'hit' or 'stale'

  // How to handle refresh to inflight?

  const startRefresh = useCallback(() => {
    startTransition(() => setState('inflight'))
    return () => startTransition(() => setState('hit'))
  }, [])

  // Revalidate on refreshInterval
  useEffect(() => {
    // If refreshInterval is nullish then we don't want to refresh.
    // Inflight means it's already refreshing and we pause the countdown.
    // It's only necessary to start the countdown if the cache isn't already stale
    if (!refreshInterval || state !== 'hit') {
      return
    }
    const timeout = setTimeout(
      () => startTransition(() => setState('stale')),
      refreshInterval
    )
    return () => clearTimeout(timeout)
  }, [refreshInterval, state])
  // Revalidate on windows focus
  useEffect(() => {
    if (state !== 'hit') {
      return
    }
    const onFocus = () => startTransition(() => setState('stale'))
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshInterval, state])
  // Revalidate on changes to shouldPause
  useEffect(() => {
    // Mark as stale pre-emptively if we're offline or the document isn't visible
    if (shouldPause && state === 'hit') {
      startTransition(() => setState('stale'))
    }
    // If not paused we can mark stale as ready for refresh
    if (!shouldPause && state === 'stale') {
      startTransition(() => setState('refresh'))
    }
  }, [shouldPause, state])

  return [state, startRefresh]
}

type LiveStoreQueryCacheMap = Map<
  QueryCacheKey,
  { query: string; params: QueryParams; listeners: Set<() => void> }
>

/**
 * Keeps track of store subscribers per cache key, in a way that's designed for useSyncExternalStore.
 * The main difference from a typical subscription state with useEffect is that `adding` and `cleanup`
 * is wholly managed by the `subscribe` function in `useSyncExternalStore`, instead of lifecycles in useEffect.
 * And since the `onStoreChange` callback, provided to `subscribe`, notifies React when to re-render,
 * there is no need to use `setState` to trigger a re-render. That's why the Map is persisted in `useState` but the state setter isn't used.
 */
function useHooks(
  setSubscriptions: React.Dispatch<React.SetStateAction<QueryCacheKey[]>>
): {
  cache: LiveStoreQueryCacheMap
  subscribe: (
    key: QueryCacheKey,
    query: string,
    params: QueryParams,
    listener: () => void
  ) => () => void
} {
  const [cache] = useState<LiveStoreQueryCacheMap>(() => new Map())
  const subscribe = useCallback(
    (
      key: QueryCacheKey,
      query: string,
      params: QueryParams,
      listener: () => void
    ) => {
      if (!cache.has(key)) {
        cache.set(key, { query, params, listeners: new Set<() => void>() })
        startTransition(() =>
          setSubscriptions((prevSubscriptions) => {
            if (prevSubscriptions.includes(key)) {
              return prevSubscriptions
            }
            return [...prevSubscriptions, key]
          })
        )
      }
      const hook = cache.get(key)
      if (!hook || !hook.listeners) {
        throw new TypeError('Inconsistent cache for key: ' + key)
      }
      const { listeners } = hook
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          cache.delete(key)
          startTransition(() =>
            setSubscriptions((prevSubscriptions) => {
              if (prevSubscriptions.includes(key)) {
                return prevSubscriptions.filter((sub) => sub !== key)
              }
              return prevSubscriptions
            })
          )
        }
      }
    },
    [cache, setSubscriptions]
  )
  return useMemo(() => ({ cache, subscribe }), [cache, subscribe])
}

interface TurboProps extends Pick<LiveStoreProviderProps, 'client'> {
  turboIds: string[]
  setTurboIds: React.Dispatch<React.SetStateAction<string[]>>
  cache: LiveStoreQueryCacheMap
  snapshots: QuerySnapshotsCache
}
/**
 * A turbo-charged mutation observer that uses Content Source Maps to apply mendoza patches on your queries
 */
const Turbo = memo(function Turbo(props: TurboProps) {
  const { client, snapshots, cache, turboIds, setTurboIds } = props
  const { projectId, dataset } = useMemo(() => {
    const { projectId, dataset } = client.config()
    return { projectId, dataset } as Required<
      Pick<ClientConfig, 'projectId' | 'dataset'>
    >
  }, [client])

  // Keep track of document ids that the active `useListeningQuery` hooks care about
  useEffect(() => {
    const nextTurboIds = new Set<string>()
    for (const { query, params } of cache.values()) {
      const key = getQueryCacheKey(query, params)
      const snapshot = snapshots.get(key)
      if (snapshot && snapshot.resultSourceMap?.documents?.length) {
        for (const { _id } of snapshot.resultSourceMap.documents) {
          nextTurboIds.add(_id)
        }
      }
    }
    const nextTurboIdsSnapshot = [...nextTurboIds].sort()
    if (JSON.stringify(turboIds) !== JSON.stringify(nextTurboIdsSnapshot)) {
      startTransition(() => setTurboIds(nextTurboIdsSnapshot))
    }
  }, [cache, setTurboIds, snapshots, turboIds])

  // Figure out which documents are misssing from the cache
  const [batch, setBatch] = useState<string[][]>([])
  useEffect(() => {
    const batchSet = new Set(batch.flat())
    const nextBatch = new Set<string>()
    for (const turboId of turboIds) {
      if (
        !batchSet.has(turboId) &&
        !documentsCache.has(getTurboCacheKey(projectId, dataset, turboId))
      ) {
        nextBatch.add(turboId)
      }
    }
    const nextBatchSlice = [...nextBatch].slice(0, 10)
    if (nextBatchSlice.length === 0) return
    startTransition(() =>
      setBatch((prevBatch) => [...prevBatch.slice(-10), nextBatchSlice])
    )
  }, [batch, dataset, projectId, turboIds])

  const [lastMutatedDocumentId, setLastMutatedDocumentId] = useState<string>()
  // Use the same listen instance and patch documents as they come in
  useEffect(() => {
    const subscription = client
      .listen(
        `*`,
        {},
        {
          events: ['mutation'],
          effectFormat: 'mendoza',
          includePreviousRevision: false,
          includeResult: false,
        }
      )
      .subscribe((update) => {
        if (update.type !== 'mutation' || !update.effects?.apply?.length) return
        // Schedule a reach state update with the ID of the document that were mutated
        // This react handler will apply the document to related source map snapshots
        const key = getTurboCacheKey(projectId, dataset, update.documentId)
        const cachedDocument = documentsCache.peek(key)
        if (cachedDocument as SanityDocument) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const patchDoc = { ...cachedDocument } as any
          delete patchDoc._rev
          const patchedDocument = applyPatch(patchDoc, update.effects.apply)
          documentsCache.set(key, patchedDocument)
        }

        startTransition(() => setLastMutatedDocumentId(update.documentId))
      })
    return () => subscription.unsubscribe()
  }, [client, dataset, projectId])

  // If the last mutated document is in the list over turboIds then lets apply the source map
  useEffect(() => {
    if (!lastMutatedDocumentId || !turboIds.includes(lastMutatedDocumentId))
      return

    const updatedKeys: QueryCacheKey[] = []
    for (const [key, snapshot] of snapshots.entries()) {
      if (snapshot.resultSourceMap?.documents?.length) {
        snapshot.result = turboChargeResultIfSourceMap(
          projectId,
          dataset,
          snapshot.result,
          snapshot.resultSourceMap
        )
        updatedKeys.push(key)
      }
    }
    for (const updatedKey of updatedKeys) {
      const listeners = cache.get(updatedKey)?.listeners
      if (listeners) {
        for (const listener of listeners) {
          listener()
        }
      }
    }
    startTransition(() => setLastMutatedDocumentId(undefined))
  }, [cache, dataset, lastMutatedDocumentId, projectId, snapshots, turboIds])

  return (
    <>
      {batch.map((ids) => (
        <GetDocuments
          key={JSON.stringify(ids)}
          client={client}
          projectId={projectId}
          dataset={dataset}
          ids={ids}
        />
      ))}
    </>
  )
})

interface GetDocumentsProps extends Pick<LiveStoreProviderProps, 'client'> {
  projectId: string
  dataset: string
  ids: string[]
}
const GetDocuments = memo(function GetDocuments(props: GetDocumentsProps) {
  const { client, projectId, dataset, ids } = props

  useEffect(() => {
    const missingIds = ids.filter(
      (id) => !documentsCache.has(getTurboCacheKey(projectId, dataset, id))
    )
    if (missingIds.length === 0) return
    client.getDocuments(missingIds).then((documents) => {
      for (const doc of documents) {
        if (doc && doc?._id) {
          documentsCache.set(getTurboCacheKey(projectId, dataset, doc._id), doc)
        }
      }
      // eslint-disable-next-line no-console
    }, console.error)
  }, [client, dataset, ids, projectId])

  return null
})

function turboChargeResultIfSourceMap(
  projectId: string,
  dataset: string,
  result: unknown,
  resultSourceMap?: ContentSourceMap
) {
  if (!resultSourceMap) return result

  return walkMap(result, (value, path) => {
    const resolveMappingResult = resolveMapping(path, resultSourceMap)
    if (!resolveMappingResult) {
      return value
    }

    const [mapping, , pathSuffix] = resolveMappingResult
    if (mapping.type !== 'value') {
      return value
    }

    if (mapping.source.type !== 'documentValue') {
      return value
    }

    const sourceDocument = resultSourceMap.documents[mapping.source.document]
    const sourcePath = resultSourceMap.paths[mapping.source.path]
    if (sourceDocument && sourceDocument._id) {
      const cachedDocument = documentsCache.get(
        getTurboCacheKey(projectId, dataset, sourceDocument._id)
      )

      const cachedValue = cachedDocument
        ? get(
            cachedDocument,
            parseNormalisedJsonPath(sourcePath + pathSuffix),
            value
          )
        : value
      // Preserve stega encoded strings, if they exist
      if (typeof cachedValue === 'string' && typeof value === 'string') {
        const { encoded } = vercelStegaSplit(value)
        const { cleaned } = vercelStegaSplit(cachedValue)
        return `${encoded}${cleaned}`
      }
      return cachedValue
    }

    return value
  })
}

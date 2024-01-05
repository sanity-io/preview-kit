import type {
  ClientConfig,
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
  SanityClient,
  SanityDocument,
} from '@sanity/client'
import { applySourceDocuments } from '@sanity/client/csm'
import { useDocumentsInUse, useRevalidate } from '@sanity/preview-kit-compat'
import { vercelStegaSplit } from '@vercel/stega'
import { LRUCache } from 'lru-cache'
import { applyPatch } from 'mendoza'
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { defineStoreContext as Context } from '../context'
import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
  LiveQueryProviderProps,
} from '../types'

const DEFAULT_TAG = 'sanity.preview-kit'

// Documents share the same cache even if there are nested providers, with a Least Recently Used (LRU) cache
const documentsCache = new LRUCache<
  ReturnType<typeof getTurboCacheKey>,
  SanityDocument
>({
  // Max 500 documents in memory, no big deal if a document is evicted it just means the eventual consistency might take longer
  max: 500,
})

/**
 * @internal
 */
const LiveStoreProvider = memo(function LiveStoreProvider(
  props: LiveQueryProviderProps,
) {
  const { children, refreshInterval = 10000, token } = props

  if (!props.client) {
    throw new Error(
      'Missing a `client` prop with a configured Sanity client instance',
    )
  }

  // Ensure these values are stable even if userland isn't memoizing properly
  const [client] = useState(() => {
    const { requestTagPrefix, resultSourceMap } = props.client.config()
    return props.client.withConfig({
      requestTagPrefix: requestTagPrefix || DEFAULT_TAG,
      resultSourceMap:
        resultSourceMap === 'withKeyArraySelector'
          ? 'withKeyArraySelector'
          : true,
      // Set the recommended defaults, this is a convenience to make it easier to share a client config from a server component to the client component
      ...(token && {
        token,
        useCdn: false,
        perspective: 'previewDrafts',
        ignoreBrowserTokenWarning: true,
      }),
    })
  })
  const [logger] = useState(() => props.logger)

  useEffect(() => {
    if (logger) {
      logger.log(
        `[@sanity/preview-kit]: With the current configuration you can expect that: Updates that can be traced using Content Source Maps will be applied in real-time. Other updates will be applied every ${refreshInterval}ms.`,
      )
    }
  }, [logger, refreshInterval])

  const [subscriptions, setSubscriptions] = useState<QueryCacheKey[]>([])
  const [snapshots] = useState<QuerySnapshotsCache>(() => new Map())
  const hooks = useHooks(setSubscriptions)
  const [context] = useState<DefineListenerContext>(() => {
    return function defineListener<QueryResult>(
      initialSnapshot: QueryResult,
      query: string,
      params: QueryParams,
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
  const [docsInUse] = useState(
    () => new Map<string, ContentSourceMapDocuments[number]>(),
  )
  const turboIdsFromSourceMap = useCallback(
    (contentSourceMap: ContentSourceMap) => {
      // This handler only adds ids, on each query fetch. But that's ok since <Turbo /> purges ids that are unused
      const nextTurboIds = new Set<string>()
      docsInUse.clear()
      if (contentSourceMap.documents?.length) {
        for (const document of contentSourceMap.documents) {
          nextTurboIds.add(document._id)
          docsInUse.set(document._id, document)
        }
      }
      startTransition(() =>
        setTurboIds((prevTurboIds) => {
          const mergedTurboIds = Array.from(
            new Set([...prevTurboIds, ...nextTurboIds]),
          )
          if (
            JSON.stringify(mergedTurboIds.sort()) ===
            JSON.stringify(prevTurboIds.sort())
          ) {
            return prevTurboIds
          }
          return mergedTurboIds
        }),
      )
    },
    [docsInUse],
  )

  return (
    <Context.Provider value={context}>
      {children}
      <Turbo
        cache={hooks.cache}
        client={client}
        setTurboIds={setTurboIds}
        snapshots={snapshots}
        turboIds={turboIds}
        docsInUse={docsInUse}
      />
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
LiveStoreProvider.displayName = 'LiveStoreProvider'
export default LiveStoreProvider

interface QuerySubscriptionProps
  extends Required<Pick<LiveQueryProviderProps, 'client' | 'refreshInterval'>> {
  query: string
  params: QueryParams
  listeners: Set<() => void>
  turboIdsFromSourceMap: (contentSourceMap: ContentSourceMap) => void
  snapshots: QuerySnapshotsCache
}
const QuerySubscription = memo(function QuerySubscription(
  props: QuerySubscriptionProps,
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
            resultSourceMap,
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
QuerySubscription.displayName = 'QuerySubscription'

type QuerySnapshotsCache = Map<
  QueryCacheKey,
  { result: unknown; resultSourceMap: ContentSourceMap }
>

function getTurboCacheKey(
  projectId: string,
  dataset: string,
  _id: string,
): `${string}-${string}-${string}` {
  return `${projectId}-${dataset}-${_id}`
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
  setSubscriptions: React.Dispatch<React.SetStateAction<QueryCacheKey[]>>,
): {
  cache: LiveStoreQueryCacheMap
  subscribe: (
    key: QueryCacheKey,
    query: string,
    params: QueryParams,
    listener: () => void,
  ) => () => void
} {
  const [cache] = useState<LiveStoreQueryCacheMap>(() => new Map())
  const subscribe = useCallback(
    (
      key: QueryCacheKey,
      query: string,
      params: QueryParams,
      listener: () => void,
    ) => {
      if (!cache.has(key)) {
        cache.set(key, { query, params, listeners: new Set<() => void>() })
        startTransition(() =>
          setSubscriptions((prevSubscriptions) => {
            if (prevSubscriptions.includes(key)) {
              return prevSubscriptions
            }
            return [...prevSubscriptions, key]
          }),
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
            }),
          )
        }
      }
    },
    [cache, setSubscriptions],
  )
  return useMemo(() => ({ cache, subscribe }), [cache, subscribe])
}

interface TurboProps extends Pick<LiveQueryProviderProps, 'client'> {
  turboIds: string[]
  docsInUse: Map<string, ContentSourceMapDocuments[number]>
  setTurboIds: React.Dispatch<React.SetStateAction<string[]>>
  cache: LiveStoreQueryCacheMap
  snapshots: QuerySnapshotsCache
}
/**
 * A turbo-charged mutation observer that uses Content Source Maps to apply mendoza patches on your queries
 */
const Turbo = memo(function Turbo(props: TurboProps) {
  const { client, snapshots, cache, turboIds, setTurboIds, docsInUse } = props
  const { projectId, dataset } = useMemo(() => {
    const { projectId, dataset } = client.config()
    return { projectId, dataset } as Required<
      Pick<ClientConfig, 'projectId' | 'dataset'>
    >
  }, [client])

  // Keep track of document ids that the active `useLiveQuery` hooks care about
  useEffect(() => {
    const nextTurboIds = new Set<string>()
    docsInUse.clear()
    for (const { query, params } of cache.values()) {
      const key = getQueryCacheKey(query, params)
      const snapshot = snapshots.get(key)
      if (snapshot && snapshot.resultSourceMap?.documents?.length) {
        for (const document of snapshot.resultSourceMap.documents) {
          nextTurboIds.add(document._id)
          docsInUse.set(document._id, document)
        }
      }
    }
    const nextTurboIdsSnapshot = [...nextTurboIds].sort()
    if (JSON.stringify(turboIds) !== JSON.stringify(nextTurboIdsSnapshot)) {
      startTransition(() => setTurboIds(nextTurboIdsSnapshot))
    }
  }, [cache, setTurboIds, snapshots, turboIds, docsInUse])
  // Sync with Presentation Tool if present
  useDocumentsInUse(docsInUse, projectId, dataset)

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
    const nextBatchSlice = [...nextBatch].slice(0, 100)
    if (nextBatchSlice.length === 0) return
    startTransition(() =>
      setBatch((prevBatch) => [...prevBatch.slice(-100), nextBatchSlice]),
    )
  }, [batch, dataset, projectId, turboIds])

  const [lastMutatedDocumentId, setLastMutatedDocumentId] = useState<string>()
  // Use the same listen instance and patch documents as they come in
  useEffect(() => {
    const subscription = (client as SanityClient)
      .listen(
        `*`,
        {},
        {
          events: ['mutation'],
          effectFormat: 'mendoza',
          includePreviousRevision: false,
          includeResult: false,
          tag: 'turbo',
        },
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
          snapshot.resultSourceMap,
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
Turbo.displayName = 'Turbo'

interface GetDocumentsProps extends Pick<LiveQueryProviderProps, 'client'> {
  projectId: string
  dataset: string
  ids: string[]
}
const GetDocuments = memo(function GetDocuments(props: GetDocumentsProps) {
  const { client, projectId, dataset, ids } = props

  useEffect(() => {
    const missingIds = ids.filter(
      (id) => !documentsCache.has(getTurboCacheKey(projectId, dataset, id)),
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
GetDocuments.displayName = 'GetDocuments'

let warnedAboutCrossDatasetReference = false
function turboChargeResultIfSourceMap(
  projectId: string,
  dataset: string,
  result: unknown,
  resultSourceMap?: ContentSourceMap,
) {
  if (!resultSourceMap) return result

  return applySourceDocuments(
    result,
    resultSourceMap,
    (sourceDocument) => {
      if (sourceDocument._projectId) {
        // eslint-disable-next-line no-warning-comments
        // @TODO Handle cross dataset references
        if (!warnedAboutCrossDatasetReference) {
          // eslint-disable-next-line no-console
          console.warn(
            'Cross dataset references are not supported yet, ignoring source document',
            sourceDocument,
          )
          warnedAboutCrossDatasetReference = true
        }
        return undefined
      }
      return documentsCache.get(
        getTurboCacheKey(projectId, dataset, sourceDocument._id),
      )
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changedValue: any, { previousValue }) => {
      if (
        typeof changedValue === 'string' &&
        typeof previousValue === 'string'
      ) {
        // Preserve stega encoded strings, if they exist
        const { encoded } = vercelStegaSplit(previousValue)
        const { cleaned } = vercelStegaSplit(changedValue)
        return `${encoded}${cleaned}`
      }
      return changedValue
    },
  )
}

/** @internal */
type QueryCacheKey = `${string}-${string}`
/** @internal */
function getQueryCacheKey(query: string, params: QueryParams): QueryCacheKey {
  return `${query}-${JSON.stringify(params)}`
}

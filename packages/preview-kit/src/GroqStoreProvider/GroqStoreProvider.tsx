import type { QueryParams } from '@sanity/client'
import DefaultEventSource from '@sanity/eventsource'
import { type Config, groqStore } from '@sanity/groq-store'
import { memo, useEffect, useMemo, useState } from 'react'

import {
  defineListenerContext as ListenerContext,
  IsEnabledContext,
  LoadedListenersContext,
} from '../context'
import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
  LiveQueryProviderProps,
  Logger,
} from '../types'
import {
  DEFAULT_MAX_DOCUMENTS,
  getQueryCacheKey,
  type QueryCacheKey,
  useLoadingListenersContext,
} from '../utils'

export type { LiveQueryProviderProps, Logger }
export type { CacheOptions } from '../types'

/**
 * @public
 */
export interface GroqStoreProviderInternalProps extends Config {
  children: React.ReactNode
  /**
   * @defaultValue true
   */
  listen?: boolean
  /**
   * @defaultValue true
   */
  overlayDrafts?: boolean
  /**
   * @defaultValue 3000
   */
  documentLimit?: number
  logger?: Logger
}
/**
 * Caches the store instance, if the config changes you need to pass a new `key` prop to apply it and trigger a re-render
 * @public
 */
export const GroqStoreProviderInternal = memo(function GroqStoreProvider(
  props: GroqStoreProviderInternalProps,
) {
  const {
    children,
    logger,
    // The rest is the store config
    ...config
  } = props

  const [ready] = useState(() => new Set<QueryCacheKey>())
  const [loadedListenersContext, updateLoadedListeners] =
    useLoadingListenersContext(ready)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [snapshots] = useState(() => new Map<QueryCacheKey, any>())
  const [store] = useState(() =>
    groqStore({
      // Override some of the store defaults
      EventSource: props.token ? DefaultEventSource : undefined,
      listen: true,
      overlayDrafts: true,
      documentLimit: DEFAULT_MAX_DOCUMENTS,
      // Spread in the rest
      ...config,
    }),
  )

  const report = useMemo(() => {
    if (config.listen) {
      return `Updates are applied in real-time. The cache is set to max ${
        config.documentLimit || DEFAULT_MAX_DOCUMENTS
      } documents.`
    }
    return `Updates require a manual refresh. The cache is set to max ${
      config.documentLimit || DEFAULT_MAX_DOCUMENTS
    } documents.`
  }, [config.documentLimit, config.listen])
  useEffect(() => {
    if (logger) {
      logger.log(
        `[@sanity/preview-kit]: With the current configuration you can expect that: ${report}`,
      )
    }
  }, [logger, report])

  // Make sure any async errors bubble up to the nearest error boundary
  const [error, setError] = useState<unknown>(null)
  // eslint-disable-next-line no-warning-comments
  // @TODO can we just re throw inside the subscription itself?
  if (error) throw error

  const [listenerContext] = useState<DefineListenerContext>(() => {
    return function defineListener<QueryResult>(
      initialSnapshot: QueryResult,
      query: string,
      params: QueryParams,
    ) {
      const key = getQueryCacheKey(query, params)

      // groq-store returns on subscriptions when the dataset haven't finished loading yet.
      // We workaround this by setting the initial value as the one provided by the hook
      if (!snapshots.has(key)) {
        snapshots.set(key, initialSnapshot)
      }

      const subscribe: ListenerSubscribe = (onStoreChange) => {
        if (!ready.has(key)) {
          store.query(query, params).then((result) => {
            if (!ready.has(key)) {
              snapshots.set(key, result)

              ready.add(key)
              updateLoadedListeners()

              onStoreChange()
            }
          }, setError)
        }

        if (!config.listen) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          return () => {}
        }

        const subscription = store.subscribe(query, params, (err, result) => {
          if (err) {
            setError(err)
            // Hold off on calling `onStoreChange` until we have a snapshot
          } else if (ready.has(key)) {
            snapshots.set(key, result)
            onStoreChange()
          }
        })
        return () => subscription.unsubscribe()
      }
      const getSnapshot: ListenerGetSnapshot<QueryResult> = () =>
        snapshots.get(key)

      return { subscribe, getSnapshot }
    } satisfies DefineListenerContext
  })

  return (
    <ListenerContext.Provider value={listenerContext}>
      <LoadedListenersContext.Provider value={loadedListenersContext}>
        <IsEnabledContext.Provider value>{children}</IsEnabledContext.Provider>
      </LoadedListenersContext.Provider>
    </ListenerContext.Provider>
  )
})
GroqStoreProviderInternal.displayName = 'GroqStoreProviderInternal'

/**
 * Handles live query updates using `@sanity/groq-store`
 * @internal
 */
export const GroqStoreProvider = memo(function GroqStoreProvider(
  props: LiveQueryProviderProps,
) {
  const { children, client, cache, logger } = props
  const {
    projectId,
    dataset,
    token,
    // eslint-disable-next-line no-warning-comments
    // @TODO @sanity/groq-store should handle `perspective` directly
    perspective = 'previewDrafts',
    requestTagPrefix,
  } = useMemo(() => client.config(), [client])

  return (
    <GroqStoreProviderInternal
      projectId={projectId!}
      dataset={dataset!}
      token={token}
      logger={logger}
      listen={cache?.listen ?? true}
      documentLimit={cache?.maxDocuments}
      overlayDrafts={perspective === 'previewDrafts'}
      includeTypes={cache?.includeTypes}
      requestTagPrefix={requestTagPrefix}
    >
      {children}
    </GroqStoreProviderInternal>
  )
})
GroqStoreProvider.displayName = 'GroqStoreProvider'

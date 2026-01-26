import type {ClientPerspective, LiveEventMessage, QueryParams, SyncTag} from '@sanity/client'
import {useEffect, useMemo, useState} from 'react'

import {defineStoreContext as Context} from '../context'
import {useShouldPause} from '../hooks'
import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
  LiveQueryProviderProps,
} from '../types'
import {DEFAULT_TAG} from './constants'
import {useLiveEvents} from './useLiveEvents'
import {type LiveQueriesUpdate, type OnStoreChange, useLiveQueries} from './useLiveQueries'
import {usePerspective} from './usePerspective'
import {getQueryCacheKey, type QueryCacheKey} from './utils'

/**
 * @internal
 */
export default function LiveStoreProvider(props: LiveQueryProviderProps): React.JSX.Element {
  const {children, token} = props

  if (!props.client) {
    throw new Error('Missing a `client` prop with a configured Sanity client instance')
  }

  const perspective = usePerspective(props.perspective || 'drafts')

  // Ensure these values are stable even if userland isn't memoizing properly
  const [client] = useState(() => {
    const {requestTagPrefix} = props.client.config()
    return props.client.withConfig({
      requestTagPrefix: requestTagPrefix || DEFAULT_TAG,
      // Set the recommended defaults, this is a convenience to make it easier to share a client config from a server component to the client component
      ...(token && {
        token,
        useCdn: false,
        perspective: 'drafts',
        ignoreBrowserTokenWarning: true,
      }),
    })
  })
  const [logger] = useState(() => props.logger)

  useEffect(() => {
    if (logger) {
      logger.log(
        `[@sanity/preview-kit]: Updates will be applied in real-time using the Sanity Live Content API.`,
      )
    }
  }, [logger])

  const {queries, snapshots, subscribe, update} = useLiveQueries()

  const context = useMemo(() => {
    return function defineListener<QueryResult>(
      initialSnapshot: QueryResult,
      query: string,
      params: QueryParams,
      hookPerspective?: Exclude<ClientPerspective, 'raw'>,
    ) {
      const effectivePerspective = hookPerspective || perspective
      const snapshotsKey = getQueryCacheKey(query, params, effectivePerspective)
      const contextSubscribe: ListenerSubscribe = (onStoreChange) => {
        const unsubscribe = subscribe({
          query,
          params,
          perspective: effectivePerspective,
          onStoreChange,
        })

        return () => unsubscribe()
      }
      const getSnapshot: ListenerGetSnapshot<QueryResult> = () =>
        snapshots.has(snapshotsKey)
          ? (snapshots.get(snapshotsKey)?.result as unknown as QueryResult)
          : initialSnapshot

      return {subscribe: contextSubscribe, getSnapshot}
    } satisfies DefineListenerContext
  }, [perspective, snapshots, subscribe])

  const liveEvents = useLiveEvents(client)

  return (
    <Context.Provider value={context}>
      {children}
      {[...queries.entries()].map(([key, {query, params, perspective, listeners}]) => {
        return (
          <QuerySubscription
            key={`${liveEvents.resets}:${key}`}
            client={client}
            listeners={listeners}
            params={params}
            query={query}
            perspective={perspective}
            liveEventsMessages={liveEvents.messages}
            snapshotKey={key}
            syncTags={snapshots.get(key)?.syncTags}
            update={update}
          />
        )
      })}
    </Context.Provider>
  )
}
LiveStoreProvider.displayName = 'LiveStoreProvider'

interface QuerySubscriptionProps extends Required<Pick<LiveQueryProviderProps, 'client'>> {
  query: string
  params: QueryParams
  perspective: Exclude<ClientPerspective, 'raw'>
  update: LiveQueriesUpdate
  snapshotKey: QueryCacheKey
  liveEventsMessages: LiveEventMessage[]
  syncTags: SyncTag[] | undefined
  listeners: Set<OnStoreChange>
}
function QuerySubscription(props: QuerySubscriptionProps) {
  const {
    client,
    query,
    params,
    perspective,
    snapshotKey,
    update,
    liveEventsMessages,
    syncTags,
    listeners,
  } = props

  const [skipEventIds] = useState(() => new Set(liveEventsMessages.map((msg) => msg.id)))
  const recentLiveEvents = useMemo(
    () => liveEventsMessages.filter((msg) => !skipEventIds.has(msg.id)),
    [liveEventsMessages, skipEventIds],
  )
  const lastLiveEvent = useMemo(
    () => recentLiveEvents.findLast((msg) => msg.tags.some((tag) => syncTags?.includes(tag))),
    [recentLiveEvents, syncTags],
  )
  const lastLiveEventId = lastLiveEvent?.id

  // Make sure any async errors bubble up to the nearest error boundary
  const [error, setError] = useState<unknown>(null)
  if (error) throw error

  const shouldPause = useShouldPause()
  useEffect(() => {
    if (shouldPause) {
      return
    }
    let fulfilled = false
    const controller = new AbortController()

    client
      .fetch(query, params, {
        lastLiveEventId,
        perspective,
        signal: controller.signal,
        filterResponse: false,
        returnQuery: false,
      })
      .then(({result, resultSourceMap, syncTags: nextTags}) => {
        update(snapshotKey, result, resultSourceMap, nextTags)
        for (const listener of listeners) {
          listener()
        }
        fulfilled = true
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error)
        }
      })

    return () => {
      if (!fulfilled) {
        controller.abort()
      }
    }
  }, [
    client,
    lastLiveEventId,
    listeners,
    params,
    perspective,
    query,
    shouldPause,
    snapshotKey,
    update,
  ])

  return null
}
QuerySubscription.displayName = 'QuerySubscription'

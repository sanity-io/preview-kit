import type { QueryParams } from '@sanity/client'
import DefaultEventSource from '@sanity/eventsource'
import { type Config, groqStore } from '@sanity/groq-store'
import { memo, useState } from 'react'

import { defineListenerContext as Context } from '../context'
import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
} from '../types'
import { getQueryCacheKey, type QueryCacheKey } from '../utils'

/**
 * @alpha
 */
export interface GroqStoreProviderProps extends Config {
  children: React.ReactNode
  /**
   * @defaultValue true
   */
  listen?: boolean
  /**
   * @defaultValue true
   */
  overlayDrafts?: boolean
}
/**
 * Caches the store instance, if the config changes you need to pass a new `key` prop to apply it and trigger a re-render
 * @alpha
 */
export const GroqStoreProvider = memo(function GroqStoreProvider(
  props: GroqStoreProviderProps
) {
  const {
    children,
    // The rest is the store config
    ...config
  } = props

  const [ready] = useState(() => new Set<QueryCacheKey>())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [snapshots] = useState(() => new Map<QueryCacheKey, any>())
  const [store] = useState(() =>
    groqStore({
      // Override some of the store defaults
      EventSource: props.token ? DefaultEventSource : undefined,
      listen: true,
      overlayDrafts: true,
      // Spread in the rest
      ...config,
    })
  )

  // Make sure any async errors bubble up to the nearest error boundary
  const [error, setError] = useState<unknown>(null)
  // eslint-disable-next-line no-warning-comments
  // @TODO can we just re throw inside the subscription itself?
  if (error) throw error

  const [context] = useState<DefineListenerContext>(() => {
    return function defineListener<QueryResult>(
      initialSnapshot: QueryResult,
      query: string,
      params: QueryParams
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
              onStoreChange()
            }
          }, setError)
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

  return <Context.Provider value={context}>{children}</Context.Provider>
})

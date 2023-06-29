/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { SanityClient } from '@sanity/client'
import { lazy, memo, Suspense, useEffect, useMemo, useState } from 'react'

import type { Logger } from './types'
import { DEFAULT_MAX_DOCUMENTS, DEFAULT_TAG } from './utils'

const LazyGroqStoreProvider = lazy(() => import('./groq-store'))
const LiveStoreProvider = lazy(() => import('./live-store'))

export type { Logger }

/** @public */
export interface CacheOptions {
  /**
   * Uses a `Listen` API call with EventSource to stream updates in real-time to the documents cache
   * @defaultValue true
   */
  listen?: boolean
  /**
   * The maximum number of documents to keep in the in-memory
   * @defaultValue 3000
   */
  maxDocuments?: number
  /**
   * Set it to an array over document `_type` names to filter the cache to, set it to an empty array to cache any type
   * @defaultValue []
   */
  includeTypes?: string[]
}

/** @public */
export interface LiveQueryProviderProps {
  children: React.ReactNode
  client: SanityClient
  cache?: CacheOptions
  /**
   * Uses a `Listen` API call with EventSource to stream updates in real-time to the documents cache, powered by `Content Source Map` metadata
   * @defaultValue true
   */
  turboSourceMap?: boolean
  /**
   * The interval in millieseconds to refetch in the background, when the tab is active.
   * It's only used if `turboSourceMap` is set to `true` or there are too many documents to fit in the local cache.
   * Set it to `0` to disable background refresh.
   * @defaultValue 10000
   */
  refreshInterval?: number
  logger?: Logger
}

export const LiveQueryProvider = memo(function LiveQueryProvider(
  props: LiveQueryProviderProps
) {
  const { children, refreshInterval = 10000 } = props

  if (!props.client) {
    throw new Error(
      'Missing a `client` prop with a configured Sanity client instance'
    )
  }

  // Ensure these values are stable even if userland isn't memoizing properly
  const [client] = useState(() =>
    props.client.withConfig({
      requestTagPrefix: props.client.config().requestTagPrefix || DEFAULT_TAG,
    })
  )
  const [cache] = useState(() => props.cache)
  const [logger] = useState(() => props.logger)
  const turboSourceMap = useMemo(
    () => props.turboSourceMap ?? client.config().resultSourceMap,
    [client, props.turboSourceMap]
  )

  if (turboSourceMap) {
    return (
      <Suspense fallback={children}>
        <LiveStoreProvider
          client={client}
          logger={logger}
          refreshInterval={refreshInterval}
          turboSourceMap={turboSourceMap}
        >
          {children}
        </LiveStoreProvider>
      </Suspense>
    )
  }

  return (
    <SelectStoreProvider
      client={client}
      cache={cache}
      logger={logger}
      refreshInterval={refreshInterval}
    >
      {children}
    </SelectStoreProvider>
  )
})

const SelectStoreProvider = memo(function SelectStoreProvider(
  props: LiveQueryProviderProps
) {
  const { children, refreshInterval, client, cache, logger } = props
  const maxDocuments = cache?.maxDocuments ?? DEFAULT_MAX_DOCUMENTS
  const [documentsCount, setDocumentsCount] = useState<number | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [includeTypes] = useState(() => cache?.includeTypes ?? [])

  // Rethrow errors to the nearest error boundary
  if (error) {
    throw error
  }

  useEffect(() => {
    if (documentsCount !== null) {
      return
    }

    logger?.log('[@sanity/preview-kit]: fetch documents count')
    const controller = new AbortController()
    client
      .fetch<number>(
        includeTypes.length > 0
          ? 'count(*[_type in $includeTypes])'
          : 'count(*)',
        { includeTypes },
        { filterResponse: true, signal: controller.signal }
      )
      .then((result) => {
        logger?.log('[@sanity/preview-kit]: documents count', result)
        setDocumentsCount(result)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error)
        }
      })
    return () => {
      controller.abort()
    }
  }, [client, documentsCount, includeTypes, logger])

  if (documentsCount === null) {
    return children
  }

  if (refreshInterval && documentsCount >= maxDocuments) {
    return (
      <Suspense fallback={children}>
        <LiveStoreProvider
          client={client}
          refreshInterval={refreshInterval}
          turboSourceMap={false}
          logger={logger}
        >
          {children}
        </LiveStoreProvider>
      </Suspense>
    )
  }

  if (documentsCount >= maxDocuments) {
    throw new Error(
      `[@sanity/preview-kit]: You have ${documentsCount} documents in your dataset, which is more than the maximum of ${maxDocuments} documents. Please reduce the number of documents in your dataset or increase the limit.`
    )
  }

  return (
    <Suspense fallback={children}>
      <GroqStoreProvider {...props}>{children}</GroqStoreProvider>
    </Suspense>
  )
})

const GroqStoreProvider = memo(function GroqStoreProvider(
  props: LiveQueryProviderProps
) {
  const { children, client, cache, logger } = props
  const {
    projectId,
    dataset,
    token,
    perspective = 'previewDrafts',
    requestTagPrefix,
  } = useMemo(() => client.config(), [client])

  return (
    <LazyGroqStoreProvider
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
    </LazyGroqStoreProvider>
  )
})

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { memo, Suspense, useEffect, useMemo, useState } from 'react'

import type { LiveQueryProviderProps, Logger } from '../types'
import { DEFAULT_MAX_DOCUMENTS, DEFAULT_TAG } from '../utils'

export type { LiveQueryProviderProps, Logger }
export type { CacheOptions } from '../types'

/**
 * @internal
 */
export function createLiveQueryProvider(options: {
  GroqStoreProvider: React.ComponentType<LiveQueryProviderProps>
  LiveStoreProvider: React.ComponentType<LiveQueryProviderProps>
}): React.ComponentType<LiveQueryProviderProps> {
  const { GroqStoreProvider, LiveStoreProvider } = options

  const SelectStoreProvider = memo((props: LiveQueryProviderProps) => {
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
          { filterResponse: true, signal: controller.signal },
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
        `[@sanity/preview-kit]: You have ${documentsCount} documents in your dataset, which is more than the maximum of ${maxDocuments} documents. Please reduce the number of documents in your dataset or increase the limit.`,
      )
    }

    return (
      <Suspense fallback={children}>
        <GroqStoreProvider {...props}>{children}</GroqStoreProvider>
      </Suspense>
    )
  })
  SelectStoreProvider.displayName = 'SelectStoreProvider'

  const LiveQueryProvider = memo((props: LiveQueryProviderProps) => {
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
        resultSourceMap: resultSourceMap || 'withKeyArraySelector',
        // Set the recommended defaults, this is a convenience to make it easier to share a client config from a server component to the client component
        ...(token && {
          token,
          useCdn: false,
          perspective: 'previewDrafts',
          ignoreBrowserTokenWarning: true,
        }),
      })
    })

    const [cache] = useState(() => props.cache)
    const [logger] = useState(() => props.logger)
    const turboSourceMap = useMemo(() => {
      const { resultSourceMap } = client.config()
      return (
        props.turboSourceMap ??
        (resultSourceMap === 'withKeyArraySelector' || resultSourceMap)
      )
    }, [client, props.turboSourceMap])

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
      <Suspense fallback={children}>
        <SelectStoreProvider
          client={client}
          cache={cache}
          logger={logger}
          refreshInterval={refreshInterval}
        >
          {children}
        </SelectStoreProvider>
      </Suspense>
    )
  })
  LiveQueryProvider.displayName = 'LiveQueryProvider'

  return LiveQueryProvider
}

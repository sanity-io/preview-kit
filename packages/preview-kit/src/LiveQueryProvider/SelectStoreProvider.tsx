import { memo, useEffect, useState } from 'react'

import { DEFAULT_MAX_DOCUMENTS } from '../utils'
import type { LiveQueryProviderInternalProps } from './types'

export const SelectStoreProvider = memo(function SelectStoreProvider(
  props: LiveQueryProviderInternalProps,
) {
  const {
    GroqStoreProvider,
    LiveStoreProvider,
    children,
    refreshInterval,
    client,
    cache,
    logger,
  } = props
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
      <LiveStoreProvider
        client={client}
        refreshInterval={refreshInterval}
        turboSourceMap={false}
        logger={logger}
      >
        {children}
      </LiveStoreProvider>
    )
  }

  if (documentsCount >= maxDocuments) {
    throw new Error(
      `[@sanity/preview-kit]: You have ${documentsCount} documents in your dataset, which is more than the maximum of ${maxDocuments} documents. Please reduce the number of documents in your dataset or increase the limit.`,
    )
  }

  return <GroqStoreProvider {...props}>{children}</GroqStoreProvider>
})
SelectStoreProvider.displayName = 'SelectStoreProvider'

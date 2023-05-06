// Live only, to preview drafts use the `scope` parameter instead, groq-store is no longer needed
import { createCache, createExternallyManagedCache } from 'suspense'
import { LRUCache } from 'lru-cache'
import type { SanityDocument } from '@sanity/client'

import type { SanityClient, ClientConfig } from '@sanity/preview-kit/client'
import { Params } from '@sanity/preview-kit'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface LiveCacheConfig {
  client: SanityClient
  documentsCacheSize?: number
}

// @TODO find out what the actual limit is
const MAX_DOCUMENTS_CACHE_SIZE = 3000

export type CachedSanityDocument = SanityDocument<Record<string, any>>

const documentsCache = createCache<
  [client: SanityClient, projectId: string, dataset: string, id: string],
  CachedSanityDocument
>({
  debugLabel: '@sanity/preview-kit/live/documents',
  config: {
    getCache: (onEvict) =>
      new LRUCache<string, any>({
        max: MAX_DOCUMENTS_CACHE_SIZE,
        dispose: (value, key, reason) => {
          if (reason === 'evict') {
            onEvict(key)
          }
        },
      }),
  },
  getKey: ([client, projectId, dataset, id]) => `${projectId}.${dataset}.${id}`,
  load(params, loadOptions) {
    const [client, , , id] = params
    return client.getDocument(id) as Promise<CachedSanityDocument>
  },
})

export function createLiveCache({ client }: LiveCacheConfig) {
  return createCache<[query: string, params?: Params], any>({
    debugLabel: '@sanity/preview-kit/live/queries',
    // getKey: ([token, query, params]) => `${query}.${JSON.stringify(params)}`,
    async load([query, params], { signal }) {
      const { projectId, dataset, resultSourceMap } =
        client.config() as unknown as ClientConfig

      // If source maps are enabled, use it to know which documents to fetch for groq store
      if (resultSourceMap) {
        // client
        const { result, resultSourceMap } = await client.fetch(query, params, {
          signal,
          // token: token || undefined,
          filterResponse: false,
        })

        if (!resultSourceMap) {
          throw new Error('Missing resultSourceMap in query response', {
            cause: { result, resultSourceMap },
          })
        }
        return { result, resultSourceMap }
      } else {
        // groq-store
      }
    },
  })
}

const LiveCacheContext = createContext<ReturnType<
  typeof createLiveCache
> | null>(null)

export function LiveContentProvider({
  children,
  client,
}: {
  children: React.ReactNode
  client: SanityClient
}) {
  const liveCache = useMemo(() => createLiveCache({ client }), [client])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (mounted) {
    return (
      <LiveCacheContext.Provider value={liveCache}>
        {children}
      </LiveCacheContext.Provider>
    )
  }

  return <>{children}</>
}

export function useLiveCache(
  query: string,
  params?: Params,
  token?: string | null
) {
  const liveCache = useContext(LiveCacheContext)

  if (!liveCache) {
    throw new TypeError('Missing LiveCacheContext', { cause: liveCache })
  }

  console.log({ liveCache })

  const response = liveCache.prefetch(query, params)

  console.log('response', response)
}

// Live only, to preview drafts use the `scope` parameter instead, groq-store is no longer needed
import { createCache, createExternallyManagedCache } from 'suspense'
import { LRUCache } from 'lru-cache'
import type { SanityDocument } from '@sanity/client'

import type { SanityClient, ClientConfig } from '@sanity/preview-kit/client'
import { Params } from '@sanity/preview-kit'

export interface LiveCacheConfig {
  client: SanityClient
  documentsCacheSize?: number
}

// @TODO find out what the actual limit is
const MAX_DOCUMENTS_CACHE_SIZE = 3000

export type CachedSanityDocument = SanityDocument<Record<string, any>>

const documentsCache = createExternallyManagedCache<
  [projectId: string, dataset: string, id: string],
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
})

export function createLiveCache({ client }: LiveCacheConfig) {
  return createCache<[query: string, params?: Params], any>({
    debugLabel: '@sanity/preview-kit/live/queries',
    async load([query, params], { signal }) {
      const { projectId, dataset, resultSourceMap } =
        client.config() as unknown as ClientConfig

      // If source maps are enabled, use it to know which documents to fetch for groq store
      if (resultSourceMap) {
        // client
        const { result, resultSourceMap } = await client.fetch(query, params, {
          signal,
          filterResponse: false,
        })

        if (!resultSourceMap) {
          throw new Error('Missing resultSourceMap in query response', {
            cause: { result, resultSourceMap },
          })
        }
      } else {
        // groq-store
      }
    },
  })
}

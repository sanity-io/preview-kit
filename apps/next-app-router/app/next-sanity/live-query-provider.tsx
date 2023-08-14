'use client'

// Tests the pattern used by next-sanity

import dynamic from 'next/dynamic'

export type {
  CacheOptions,
  LiveQueryProviderProps,
  Logger,
} from '@sanity/preview-kit'
import { createLiveQueryProvider } from '@sanity/preview-kit/internals/create-live-query-provider'

const GroqStoreProvider = dynamic(
  () => import('@sanity/preview-kit/internals/groq-store-provider'),
)
const LiveStoreProvider = dynamic(
  () => import('@sanity/preview-kit/internals/live-store-provider'),
)

export default createLiveQueryProvider({ GroqStoreProvider, LiveStoreProvider })

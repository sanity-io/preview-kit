import { lazy } from 'react'

import { createLiveQueryProvider } from './createLiveQueryProvider'

export * from './createLiveQueryProvider'

const GroqStoreProvider = lazy(() => import('../GroqStoreProvider'))
const LiveStoreProvider = lazy(() => import('../LiveStoreProvider'))

/** @public */
export const LiveQueryProvider = createLiveQueryProvider({
  GroqStoreProvider,
  LiveStoreProvider,
})

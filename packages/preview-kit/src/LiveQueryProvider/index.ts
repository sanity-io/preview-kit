import { lazy } from 'react'

import type { LiveQueryProviderProps } from '../types'

/** @public */
export const LiveQueryProvider = lazy(() => import('./LiveQueryProvider'))

/**
 * @deprecated Use `LiveQueryProvider` instead
 * @internal
 */
export function createLiveQueryProvider(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: {
    GroqStoreProvider: React.ComponentType<LiveQueryProviderProps>
    LiveStoreProvider: React.ComponentType<LiveQueryProviderProps>
  },
): React.ComponentType<LiveQueryProviderProps> {
  return LiveQueryProvider
}

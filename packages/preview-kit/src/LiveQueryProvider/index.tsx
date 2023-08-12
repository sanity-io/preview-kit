import { lazy, Suspense } from 'react'

import type { CacheOptions, LiveQueryProviderProps, Logger } from '../types'

export type { CacheOptions, LiveQueryProviderProps, Logger }

const LazyGroqStoreProvider = lazy(() => import('../GroqStoreProvider/lazy'))
const LazyLiveStoreProvider = lazy(() => import('../LiveStoreProvider/lazy'))
const LazyLiveQueryProvider = lazy(() => import('./lazy'))

function DynamicGroqStoreProvider(props: LiveQueryProviderProps) {
  return (
    <Suspense fallback={props.children}>
      <LazyGroqStoreProvider {...props} />
    </Suspense>
  )
}
DynamicGroqStoreProvider.displayName = 'DynamicGroqStoreProvider'
function DynamicLiveStoreProvider(props: LiveQueryProviderProps) {
  return (
    <Suspense fallback={props.children}>
      <LazyLiveStoreProvider {...props} />
    </Suspense>
  )
}
DynamicLiveStoreProvider.displayName = 'DynamicLiveStoreProvider'

export function LiveQueryProvider(
  props: LiveQueryProviderProps,
): React.JSX.Element {
  return (
    <Suspense fallback={props.children}>
      <LazyLiveQueryProvider
        {...props}
        GroqStoreProvider={DynamicGroqStoreProvider}
        LiveStoreProvider={DynamicLiveStoreProvider}
      />
    </Suspense>
  )
}
LiveQueryProvider.displayName = 'LiveQueryProvider'

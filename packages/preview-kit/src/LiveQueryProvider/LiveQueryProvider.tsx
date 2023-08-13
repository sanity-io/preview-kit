/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { memo, useMemo, useState } from 'react'

import type { LiveQueryProviderProps, Logger } from '../types'
import { DEFAULT_TAG } from '../utils'
import { SelectStoreProvider } from './SelectStoreProvider'
import { LiveQueryProviderInternalProps } from './types'

export type { LiveQueryProviderProps, Logger }
export type { CacheOptions } from '../types'

/**
 * @internal
 */
export const LiveQueryProviderInternal = memo(
  function LiveQueryProviderInternal(props: LiveQueryProviderInternalProps) {
    const {
      GroqStoreProvider,
      LiveStoreProvider,
      children,
      refreshInterval = 10000,
      token,
    } = props

    if (!props.client) {
      throw new Error(
        'Missing a `client` prop with a configured Sanity client instance',
      )
    }

    // Ensure these values are stable even if userland isn't memoizing properly
    const [client] = useState(() =>
      props.client.withConfig({
        requestTagPrefix: props.client.config().requestTagPrefix || DEFAULT_TAG,
        // Set the recommended defaults, this is a convenience to make it easier to share a client config from a server component to the client component
        ...(token && {
          token,
          useCdn: false,
          perspective: 'previewDrafts',
          ignoreBrowserTokenWarning: true,
        }),
      }),
    )
    const [cache] = useState(() => props.cache)
    const [logger] = useState(() => props.logger)
    const turboSourceMap = useMemo(
      () => props.turboSourceMap ?? client.config().resultSourceMap,
      [client, props.turboSourceMap],
    )

    if (turboSourceMap) {
      return (
        <LiveStoreProvider
          client={client}
          logger={logger}
          refreshInterval={refreshInterval}
          turboSourceMap={turboSourceMap}
        >
          {children}
        </LiveStoreProvider>
      )
    }

    return (
      <SelectStoreProvider
        GroqStoreProvider={GroqStoreProvider}
        LiveStoreProvider={LiveStoreProvider}
        client={client}
        cache={cache}
        logger={logger}
        refreshInterval={refreshInterval}
      >
        {children}
      </SelectStoreProvider>
    )
  },
)
LiveQueryProviderInternal.displayName = 'LiveQueryProviderInternal'

import { createContext } from 'react'

import { NoStoreContext } from './no-store'
import { DefineListenerContext } from './types'
import { QueryCacheKey } from './utils'

/**
 * @internal
 */
export const defineListenerContext =
  createContext<DefineListenerContext>(NoStoreContext)

/**
 * If it's `null` then the listener should be treated as `success`, otherwise if a listener isn't in the array it should be considered as `loading`
 * @internal
 */
export const LoadedListenersContext = createContext<QueryCacheKey[] | null>(
  null
)

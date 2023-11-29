import { createContext } from 'react'

import { DefineListenerContext } from './types'

/**
 * @internal
 */
export const defineStoreContext = createContext<DefineListenerContext | null>(
  null,
)

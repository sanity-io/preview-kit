import { createContext } from 'react'

import { NoStoreContext } from './no-store'
import { DefineListenerContext } from './types'

/**
 * @internal
 */
export const defineListenerContext =
  createContext<DefineListenerContext>(NoStoreContext)

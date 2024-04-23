import {createContext} from 'react'

import type {DefineListenerContext} from './types'

/**
 * @internal
 */
export const defineStoreContext = createContext<DefineListenerContext | null>(null)

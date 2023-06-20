// Used by the deprecated `/groq-store` entry point

import { GroqStoreProvider as GroqStoreProviderComponent } from './GroqStoreProvider'
export type { Logger } from '../types'
export type { GroqStoreProviderProps } from './GroqStoreProvider'

/**
 * @public
 * @deprecated Use `useGroqStore` instead.
 */
export const GroqStoreProvider = GroqStoreProviderComponent

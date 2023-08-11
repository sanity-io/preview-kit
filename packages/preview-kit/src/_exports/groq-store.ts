import { GroqStoreProviderInternal } from '../GroqStoreProvider/GroqStoreProvider'
export type { GroqStoreProviderInternalProps as GroqStoreProviderProps } from '../GroqStoreProvider/GroqStoreProvider'
export type { CacheOptions, LiveQueryProviderProps, Logger } from '../types'

/**
 * @public
 * @deprecated Use `import {GroqStoreProvider} from  '@sanity/preview-kit/internals/groq-store'` instead.
 */
export const GroqStoreProvider = GroqStoreProviderInternal

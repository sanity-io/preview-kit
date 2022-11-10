import type { Config, GroqStore } from '@sanity/groq-store'

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * Lazy loaded, heavy, libs. Most use cases want to wrap these in `suspend-react`:
 * ```tsx
 * import {suspend} from 'suspend-react'
 * import {_lazyGroqStore} from '@sanity/preview-kit'
 *
 * export default function PreviewComponent() {
 *   const groqStore = suspend(() => _lazyGroqStore(), ['@sanity/preview-kit', '@sanity/groq-store])
 * }
 * ```
 * This makes them load in any app that uses React 18 and have Suspense features enabled.
 * For Next 13 and React Server Components, they should be wrapped in `React.use` and `React.cache`, this is done for you by `next-sanity`:
 * ```tsx
 * import {cache, use} from 'react'
 * import {_lazyGroqStore} from '@sanity/preview-kit'
 *
 * const lazyGroqStore = cache(_lazyGroqStore)
 *
 * export default function PreviewComponent() {
 *   const groqStore = use(lazyGroqStore())
 * }
 * ```
 * @internal
 */
export const _lazyGroqStore = async () => {
  const { groqStore } = await import('@sanity/groq-store')
  return groqStore as (config: Config) => GroqStore
}

/**
 * See the typings for `_lazyGroqStore` for detailed usage instructions.
 * @internal
 */
export const _lazyEventSourcePolyfill = async () => {
  const { EventSourcePolyfill } = await import('event-source-polyfill')
  return EventSourcePolyfill
}

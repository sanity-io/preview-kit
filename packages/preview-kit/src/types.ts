import type { QueryParams, SanityClient } from '@sanity/client'

/**
 * @internal
 */
export type ListenerSubscribe = (onStoreChange: () => void) => () => void

/**
 * @internal
 */
export type ListenerGetSnapshot<QueryResult> = () => QueryResult

/**
 * @internal
 */
export type DefineListenerContext = <QueryResult>(
  initialSnapshot: QueryResult,
  query: string,
  params: QueryParams,
) => {
  subscribe: ListenerSubscribe
  getSnapshot: ListenerGetSnapshot<QueryResult>
}

/**
 * Specify a `console.log` compatible logger to aid debugging
 * @public
 */
export type Logger =
  | typeof console
  | Pick<typeof console, 'warn' | 'error' | 'log'>

/** @public */
export interface CacheOptions {
  /**
   * Uses a `Listen` API call with EventSource to stream updates in real-time to the documents cache
   * @defaultValue true
   */
  listen?: boolean
  /**
   * The maximum number of documents to keep in the in-memory
   * @defaultValue 3000
   */
  maxDocuments?: number
  /**
   * Set it to an array over document `_type` names to filter the cache to, set it to an empty array to cache any type
   * @defaultValue []
   */
  includeTypes?: string[]
}

/** @public */
export interface LiveQueryProviderProps {
  children: React.ReactNode
  client: SanityClient
  /**
   * Reconfigures `client` with the provided `token`, as well as changing its configuration to
   * have `perspective: 'previewDrafts'`, `useCdn: false` and `ignoreBrowserTokenWarning: true`.
   * If you want to use a different configuration, then use just the `client` prop and set the token yourself,
   * for example by: `client={client.withConfig({token})}`
   */
  token?: string
  cache?: CacheOptions
  /**
   * Uses a `Listen` API call with EventSource to stream updates in real-time to the documents cache, powered by `Content Source Map` metadata
   * @defaultValue true
   */
  turboSourceMap?: boolean
  /**
   * The interval in millieseconds to refetch in the background, when the tab is active.
   * It's only used if `turboSourceMap` is set to `true` or there are too many documents to fit in the local cache.
   * Set it to `0` to disable background refresh.
   * @defaultValue 10000
   */
  refreshInterval?: number
  logger?: Logger
}

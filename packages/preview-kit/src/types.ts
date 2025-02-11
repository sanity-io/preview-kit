import type {ClientPerspective, QueryParams, SanityClient} from '@sanity/client'
import type {SanityStegaClient} from '@sanity/client/stega'

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
export type Logger = typeof console | Pick<typeof console, 'warn' | 'error' | 'log'>

/**
 * @public
 * @deprecated these options are no longer used
 */
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
  /**
   * The Sanity client to use for fetching data and listening to mutations.
   */
  client: SanityClient | SanityStegaClient
  /**
   * Reconfigures `client` with the provided `token`, as well as changing its configuration to
   * have `perspective: 'drafts'`, `useCdn: false` and `ignoreBrowserTokenWarning: true`.
   * If you want to use a different configuration, then use just the `client` prop and set the token yourself,
   * for example by: `client={client.withConfig({token})}`
   */
  token?: string
  /** @deprecated these options are no longer used */
  cache?: CacheOptions
  /**
   * @deprecated this option is now always enabled
   */
  turboSourceMap?: boolean
  /**
   * How frequently queries should be refetched in the background to refresh the parts of queries that can't be source mapped.
   * Setting it to `0` will disable background refresh.
   * @defaultValue 10000
   */
  refreshInterval?: number
  logger?: Logger
  /**
   * @defaultValue 'drafts'
   */
  perspective?: Exclude<ClientPerspective, 'raw'>
}

/** @public */
export type QueryLoading = boolean

/** @public */
export type QueryEnabled = boolean

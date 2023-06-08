import type { QueryParams } from '@sanity/client'

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
  params: QueryParams
) => {
  subscribe: ListenerSubscribe
  getSnapshot: ListenerGetSnapshot<QueryResult>
}

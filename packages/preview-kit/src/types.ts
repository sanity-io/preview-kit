import type { QueryParams } from '@sanity/client'

/**
 * @internal
 */
export type ListenerSubscribe = (onStoreChange: () => void) => () => void

/**
 * @internal
 */
export type ListenerGetSnapshot<Snapshot> = () => Snapshot

/**
 * @internal
 */
export type DefineListenerContext = <Snapshot>(
  initialSnapshot: Snapshot,
  query: string,
  params: QueryParams
) => {
  subscribe: ListenerSubscribe
  getSnapshot: ListenerGetSnapshot<Snapshot>
}

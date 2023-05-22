import type { QueryParams as ClientQueryParams } from '@sanity/client'
import { useContext, useMemo } from 'react'
import isFastEqual from 'react-fast-compare'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { defineListenerContext } from './context'

// Re-export types we use that are needed externally
export type { ClientQueryParams }

/** @public */
export function useListeningQuery<Snapshot>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams?: ClientQueryParams
): Snapshot
/** @public */
export function useListeningQuery<Snapshot, QueryParams = ClientQueryParams>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams: QueryParams
): Snapshot
/** @public */
export function useListeningQuery<Snapshot, QueryParams extends undefined>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams?: QueryParams | Record<string, never>
): Snapshot
/** @public */
export function useListeningQuery<
  Snapshot,
  QueryParams = ClientQueryParams | undefined
>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams: QueryParams,
  selector: undefined,
  isEqual: (a: Snapshot, b: Snapshot) => boolean
): Snapshot
/** @public */
export function useListeningQuery<
  Snapshot,
  QueryParams = ClientQueryParams | undefined,
  Selection = Snapshot
>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams: QueryParams,
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean
): Selection
/** @public */
export function useListeningQuery<
  Snapshot,
  QueryParams extends ClientQueryParams,
  Selection = Snapshot
>(
  initialSnapshot: Snapshot,
  query: string,
  queryParams: QueryParams = {} as QueryParams,
  selector: (snapshot: Snapshot) => Selection = (snapshot) =>
    snapshot as unknown as Selection,
  isEqual: (a: Selection, b: Selection) => boolean = isFastEqual
): Selection {
  const defineStore = useContext(defineListenerContext)
  const params = useParams(queryParams)
  const store = useMemo(
    () => defineStore<Snapshot>(initialSnapshot, query, params),
    [defineStore, initialSnapshot, params, query]
  )

  return useSyncExternalStoreWithSelector<Snapshot, Selection>(
    store.subscribe,
    store.getSnapshot,
    () => initialSnapshot,
    selector,
    isEqual
  )
}

// /*
// Just for quickly testing the overload typings
function TestComponent() {
  const snapshot = [{_id: '123'}]
  // All of these should be legal
  useListeningQuery(snapshot, '*').sort()
  useListeningQuery(snapshot, '*', undefined).sort()
  useListeningQuery(snapshot, '*', {}).sort()
  useListeningQuery(snapshot, '*', undefined, (snapshot) => snapshot).sort()
  useListeningQuery(snapshot, '*', undefined, (snapshot) => snapshot, (a, b) => a.length === b.length).sort()
  useListeningQuery(snapshot, '*', undefined, undefined, (a, b) => a.length === b.length).sort()
  useListeningQuery(snapshot, '*', {}, (snapshot) => snapshot).sort()
  useListeningQuery(snapshot, '*', {}, (snapshot) => snapshot, (a, b) => a.length === b.length).sort()
  useListeningQuery(snapshot, '*', {}, undefined, (a, b) => a.length === b.length).sort()
  useListeningQuery(snapshot, '*[_id == $id]', {id: '123'}, (snapshot) => snapshot).sort()
  useListeningQuery(snapshot, '*[_id == $id]', {id: '123'} , (snapshot) => snapshot, (a, b) => a.length === b.length).sort()
  useListeningQuery(snapshot, '*[_id == $id]', {id: '123'}, undefined, (a, b) => a.length === b.length).sort()
  // Selector should change the return type, and the types in isEqual
  useListeningQuery(snapshot, '*', undefined, (snapshot) => snapshot[0])._id
  useListeningQuery(snapshot, '*', undefined, (snapshot) => snapshot[0], (a, b) => a._id === b._id)._id
  useListeningQuery(snapshot, '*', {}, (snapshot) => snapshot[0])._id
  useListeningQuery(snapshot, '*', {}, (snapshot) => snapshot[0], (a, b) => a._id === b._id)._id
  useListeningQuery(snapshot, '*[_id == $id]', {id: '123'}, (snapshot) => snapshot[0])._id
  useListeningQuery(snapshot, '*[_id == $id]', {id: '123'} , (snapshot) => snapshot[0], (a, b) => a._id === b._id)._id
  // Generics should allow tighter types
  useListeningQuery<typeof snapshot, {id: string}>(snapshot, '*[_id == $id]', {id: '123'}).sort()
  // @ts-expect-error - disallow passing in a snapshot with the wrong type
  useListeningQuery<typeof snapshot, {id: string}>(null, '*[_id == $id]', {id: '123'}).sort()
  // @ts-expect-error - query params are required
  useListeningQuery<typeof snapshot, {id: string}>(snapshot, '*[_id == $id]').sort()
  // @ts-expect-error - query params are not allowed
  useListeningQuery<typeof snapshot, undefined>(snapshot, '*', {id: '123'}).sort()
  useListeningQuery<typeof snapshot, undefined>(snapshot, '*').sort()
  useListeningQuery<typeof snapshot, undefined>(snapshot, '*', {}).sort()
  // @ts-expect-error - query params are not allowed
  useListeningQuery<typeof snapshot, undefined>(snapshot, '*', {_id: '123'}).sort()
  useListeningQuery<typeof snapshot, {id: string}, (typeof snapshot)[number]>(snapshot, '*', {id: '123'}, (snapshot) => snapshot[0])._id
  useListeningQuery<typeof snapshot, {id: string}, (typeof snapshot)[number]>(snapshot, '*', {id: '123'}, (snapshot) => snapshot[0], (a, b) => a._id === b._id)._id
  // @ts-expect-error - selection generic requires an array item to be returned
  useListeningQuery<typeof snapshot, {id: string}, (typeof snapshot)[number]>(snapshot, '*', {id: '123'}, (snapshot) => snapshot)._id
  // @ts-expect-error - selection generic requires an array item to be returned
  useListeningQuery<typeof snapshot, {id: string}, (typeof snapshot)[number]>(snapshot, '*', {id: '123'})._id
  // @ts-expect-error - selection generic requires an array item to be returned
  useListeningQuery<typeof snapshot, {id: string}, (typeof snapshot)[number]>(snapshot, '*', {id: '123'}, undefined, (a, b) => a._id === b._id)._id
}
// */

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
function useParams(
  params?: undefined | null | ClientQueryParams
): ClientQueryParams {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params]
  )
  return useMemo(() => JSON.parse(stringifiedParams), [stringifiedParams])
}

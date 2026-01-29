// This is a smaller version of `useLiveQuery`, as `LiveQuery` doesn't
// need the more advanced features `useLiveQuery`, like the `isEqual` option or the `loading` state

import type {QueryParams as ClientQueryParams} from '@sanity/client'
import type {QueryEnabled} from '@sanity/preview-kit'
import {useCallback, useContext, useMemo, useState, useSyncExternalStore} from 'react'

import {defineStoreContext} from '../../context'
import {useQueryParams} from '../../hooks'

/** @internal */
export function useLiveQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
>(
  initialData: QueryResult,
  query: string,
  queryParams2?: QueryParams,
): [QueryResult, QueryEnabled] {
  const defineStore = useContext(defineStoreContext)
  const queryParams = useQueryParams(queryParams2)
  const store = useMemo(
    () => defineStore?.<QueryResult>(initialData, query, queryParams, undefined),
    [defineStore, initialData, queryParams, query],
  )
  // initialSnapshot might change before hydration is done, so deep cloning it on the first hook call
  // helps ensure that we don't get a mismatch between the server and client snapshots
  const [serverSnapshot] = useState(() => {
    if (initialData === undefined) {
      throw new Error(
        `initialSnapshot can't be undefined, if you don't want an initial value use null instead`,
      )
    }
    try {
      return JSON.parse(JSON.stringify(initialData))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        "Failed to deep clone initialSnapshot, this is likely an error and an indication that the snapshot isn't JSON serializable",
        {initialSnapshot: initialData, error},
      )
      return initialData
    }
  })
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot])

  return [
    useSyncExternalStore(
      store?.subscribe || noop,
      store?.getSnapshot || getServerSnapshot,
      getServerSnapshot,
    ),
    defineStore !== null,
  ]
}

function noop() {
  return () => {}
}

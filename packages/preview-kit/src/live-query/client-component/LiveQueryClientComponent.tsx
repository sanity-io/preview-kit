import type {QueryParams as ClientQueryParams} from '@sanity/client'
import {Children, cloneElement, isValidElement, memo} from 'react'

import {useLiveQuery} from './useLiveQuery'

/** @public */
export interface LiveQueryClientComponentProps<QueryResult, QueryParams> {
  children?: React.ReactNode | undefined
  /**
   * If a parent <LiveQueryProvider> is missing, then an error is thrown.
   * If you want to disable this behavior, set this prop to false.
   * @defaultValue true
   */
  throwOnMissingProvider?: boolean
  initialData: QueryResult
  query: string
  params?: QueryParams | undefined
}

/**
 * Browser-only preview component, overwrites the data prop with live data on-demand
 * @public
 */
function LiveQueryClientComponent<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
>(props: LiveQueryClientComponentProps<QueryResult, QueryParams>): React.ReactNode {
  const {initialData, query, params, children, throwOnMissingProvider = true} = props
  const [data, enabled] = useLiveQuery<QueryResult, QueryParams>(initialData, query, params)
  // This hook is only used by `LiveQuery` when its `enabled` prop is true,
  // so we can reliably assume that if a parent provider is missing then that's an error
  if (throwOnMissingProvider && !enabled) {
    // Throw and let them know a parent <LiveQueryProvider> is missing
    throw new Error(
      `<LiveQuery> require you to wrap them in a parent <LiveQueryProvider> when its 'enabled' prop is true, or set the 'throwOnMissingProvider' prop to 'false' to ignore this error`,
    )
  }

  /**
   * The original source for the rest of this component is `Slot` from `@radix-ui/react-slot`: https://github.com/radix-ui/primitives/blob/3e0642e40038386d58da9fb1d812c2fbfe9f67c1/packages/react/slot/src/Slot.tsx
   * It's copied and modified here as the original doesn't override the props on children, which would require us to use this pattern:
   * ```<LiveQuery initialData={data}><Posts /></LiveQuery>```
   * However, we want to use this pattern as it preserves the same type safety as before live queries are added:
   * ```<LiveQuery initialData={data}><Posts data={data} /></LiveQuery>```
   *
   * It also made sense to modify the original as our use case is smaller than radix, for example we don't have to worry about merging `style` props
   */
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...children.props,
      // all child props should override, except for `data`
      data,
      // eslint-disable-next-line no-warning-comments
      // @ts-expect-error -- @todo fix the typings
      ref: children.ref,
    })
  }

  return Children.count(children) > 1 ? Children.only(null) : null
}
LiveQueryClientComponent.displayName = 'LiveQueryClientComponent'

/** @public */
export type {LiveQueryClientComponent}

/** @public */
const LiveQueryClientComponentMemo = memo(LiveQueryClientComponent)
export default LiveQueryClientComponentMemo

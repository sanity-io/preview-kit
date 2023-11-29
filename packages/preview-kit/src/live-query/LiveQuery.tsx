import type { QueryParams as ClientQueryParams } from '@sanity/client'
import { Children, isValidElement, lazy } from 'react'

import type { LiveQueryClientComponentProps } from './LiveQueryClientComponent'

const ClientComponent = lazy(() => import('./LiveQueryClientComponent'))

/** @public */
export interface LiveQueryProps<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
> extends LiveQueryClientComponentProps<QueryResult, QueryParams> {
  enabled: boolean
  // eslint-disable-next-line no-warning-comments
  // @TODO fix typing of this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: React.ComponentType<any>
}

const DEFAULT_PARAMS = {} as ClientQueryParams

/** @public */
export function LiveQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
>(props: LiveQueryProps<QueryResult, QueryParams>): React.ReactNode {
  // Always passthrough when not enabled
  if (!props.enabled) {
    return props.children
  }

  const {
    query,
    params = DEFAULT_PARAMS,
    initialData,
    as: LiveComponent,
  } = props
  // If we have an `as` prop it means we're likely working around a `children` that is RSC, and the `as` prop provides a Client Component
  if (LiveComponent) {
    if (Children.count(props.children) > 1) {
      throw new Error(
        'LiveQuery: `as` prop can only be used with a single child',
      )
    }
    if (!isValidElement(props.children)) {
      throw new Error('LiveQuery: `as` prop requires a valid `children` prop')
    }

    return (
      <ClientComponent
        // eslint-disable-next-line no-warning-comments
        // @TODO improve the typing of this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={initialData as any}
        query={query}
        // eslint-disable-next-line no-warning-comments
        // @TODO improve the typing of this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params={params as any}
        throwOnMissingProvider={props.throwOnMissingProvider}
      >
        <LiveComponent {...props.children.props} />
      </ClientComponent>
    )
  }

  // Setup a `useLiveQuery` wrapper and override the `data` prop on the children component
  return (
    <ClientComponent
      // eslint-disable-next-line no-warning-comments
      // @TODO improve the typing of this
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialData={initialData as any}
      query={query}
      // eslint-disable-next-line no-warning-comments
      // @TODO improve the typing of this
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
    >
      {props.children}
    </ClientComponent>
  )
}
LiveQuery.displayName = 'LiveQuery'

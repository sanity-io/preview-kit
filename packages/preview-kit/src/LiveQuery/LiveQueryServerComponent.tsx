import type { QueryParams as ClientQueryParams } from '@sanity/client'
import { Children, isValidElement, Suspense } from 'react'

import type { LiveQueryClientComponentProps } from './LiveQueryClientComponent'

export type { ClientQueryParams, LiveQueryClientComponentProps }

export interface LiveQueryServerComponentProps<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
> extends LiveQueryClientComponentProps<QueryResult, QueryParams> {
  enabled: boolean
  ClientComponent: React.ComponentType<
    LiveQueryClientComponentProps<QueryResult, QueryParams>
  >
  // eslint-disable-next-line no-warning-comments
  // @TODO fix typing of this
  as?: React.ComponentType
}

const DEFAULT_PARAMS = {} as ClientQueryParams

// Component just renders its children if preview mode is not enabled
export function LiveQueryServerComponent<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
>(
  props: LiveQueryServerComponentProps<QueryResult, QueryParams>,
): React.ReactNode {
  // Always passthrough when not enabled
  if (!props.enabled) {
    return props.children
  }

  const {
    query,
    params = DEFAULT_PARAMS,
    initialData,
    as: LiveComponent,
    ClientComponent,
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
      <Suspense fallback={props.children}>
        <ClientComponent
          initialData={initialData}
          query={query}
          // eslint-disable-next-line no-warning-comments
          // @TODO improve the typing of this
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params={params as any}
        >
          <LiveComponent {...props.children.props} />
        </ClientComponent>
      </Suspense>
    )
  }

  // Setup a `useLiveQuery` wrapper and override the `data` prop on the children component
  return (
    <Suspense fallback={props.children}>
      <ClientComponent
        initialData={initialData}
        query={query}
        // eslint-disable-next-line no-warning-comments
        // @TODO improve the typing of this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params={params as any}
      >
        {props.children}
      </ClientComponent>
    </Suspense>
  )
}
LiveQueryServerComponent.displayName = 'LiveQueryServerComponent'

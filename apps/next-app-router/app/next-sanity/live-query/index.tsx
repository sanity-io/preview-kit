// Simulates what `next-sanity` does for app-router compatibility

import type { QueryParams as ClientQueryParams } from '@sanity/client'
import {
  LiveQueryServerComponent,
  type LiveQueryServerComponentProps,
} from '@sanity/preview-kit/internals/live-query-server'
import ClientComponent from './LiveQueryClientComponent'

export type {
  ClientQueryParams,
  LiveQueryClientComponentProps,
  LiveQueryServerComponentProps,
} from '@sanity/preview-kit/internals/live-query-server'


export interface LiveQueryProps<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
> extends Omit<
    LiveQueryServerComponentProps<QueryResult, QueryParams>,
    'ClientComponent'
  > {}

export function LiveQuery<
  QueryResult,
  QueryParams extends ClientQueryParams = ClientQueryParams,
>(props: LiveQueryProps<QueryResult, QueryParams>): React.JSX.Element {
  return (
    <LiveQueryServerComponent {...props} ClientComponent={ClientComponent} />
  )
}
LiveQuery.displayName = 'LiveQuery'

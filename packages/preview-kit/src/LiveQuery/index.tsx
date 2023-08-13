import type { QueryParams as ClientQueryParams } from '@sanity/client'
import { lazy } from 'react'

import {
  LiveQueryServerComponent,
  type LiveQueryServerComponentProps,
} from './LiveQueryServerComponent'

export type {
  ClientQueryParams,
  LiveQueryClientComponentProps,
  LiveQueryServerComponentProps,
} from './LiveQueryServerComponent'

const ClientComponent = lazy(() => import('./LiveQueryClientComponent'))

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

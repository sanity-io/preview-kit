import { lazy } from 'react'

import { createConditionalLiveQuery } from './createConditionalLiveQuery'

export type {
  ClientQueryParams,
  LiveQueryClientComponentProps,
  LiveQueryProps,
} from './createConditionalLiveQuery'

const ClientComponent = lazy(() => import('./LiveQueryClientComponent'))

/**
 * This is an experimental new API that might have breaking changes in minor versions.
 * @alpha */
export const LiveQuery = createConditionalLiveQuery({ ClientComponent })

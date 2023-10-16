import { lazy } from 'react'

import { createConditionalLiveQuery } from '../../dist/internals/create-conditional-live-query.js'

const ClientComponent = lazy(() => import('./index.client.js'))

export const LiveQuery = createConditionalLiveQuery({ ClientComponent })
export default LiveQuery

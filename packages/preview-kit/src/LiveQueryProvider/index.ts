import {lazy} from 'react'

import type {LiveQueryProviderProps} from '../types'

/** @public */
export const LiveQueryProvider = lazy<React.ComponentType<LiveQueryProviderProps>>(
  () => import('./LiveQueryProvider'),
)

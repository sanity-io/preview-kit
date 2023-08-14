// Simulates what `next-sanity` does for app-router compatibility

import {  createConditionalLiveQuery
} from '@sanity/preview-kit/internals/create-conditional-live-query'
import ClientComponent from './LiveQueryClientComponent'


export const LiveQuery = createConditionalLiveQuery({ClientComponent})
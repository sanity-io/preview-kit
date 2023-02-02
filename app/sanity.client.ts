import {
  createClient as _createClient,
  type SanityClient,
} from '@sanity/client'

import { apiVersion, dataset, projectId, useCdn } from './config'

export const createClient = (): SanityClient =>
  _createClient({ projectId, dataset, apiVersion, useCdn })

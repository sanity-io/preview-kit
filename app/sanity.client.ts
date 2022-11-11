import sanityClient, { type SanityClient } from '@sanity/client'

import { apiVersion, dataset, projectId, useCdn } from './config'

export const createClient = (): SanityClient =>
  sanityClient({ projectId, dataset, apiVersion, useCdn })

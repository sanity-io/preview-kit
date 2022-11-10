import sanityClient, { type SanityClient } from '@sanity/client'

import { projectId, dataset, apiVersion, useCdn } from './config'

export const createClient = (): SanityClient =>
  sanityClient({ projectId, dataset, apiVersion, useCdn })

import SanityClient from '@sanity/client'

import { projectId, dataset, apiVersion, useCdn } from './config'

export const client = new SanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
})

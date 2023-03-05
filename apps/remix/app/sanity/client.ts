import { createClient } from '@sanity/client'

import { projectId, dataset, apiVersion, useCdn } from './config'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
})

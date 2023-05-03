import { createClient } from '@sanity/preview-kit/client'

import { projectId, dataset, apiVersion, useCdn } from './config'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: 'https://preview-kit-test-studio.sanity.build/',
  encodeSourceMap: true,
})

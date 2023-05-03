import {
  createClient as _createClient,
  type SanityClient,
} from '@sanity/preview-kit/client'

import { apiVersion, dataset, projectId, useCdn } from './config'

export const createClient = (): SanityClient =>
  _createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    studioUrl: 'https://preview-kit-test-studio.sanity.build/',
  })

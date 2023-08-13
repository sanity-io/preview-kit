import { createClient } from '@sanity/preview-kit/client'

const projectId = 'pv8y60vp'
const dataset = 'production'
const apiVersion = '2022-11-15'
const useCdn = false
const studioUrl = 'https://preview-kit-test-studio.sanity.build/'
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl,
  logger: console,
  encodeSourceMap: true,
  perspective: 'published',
})

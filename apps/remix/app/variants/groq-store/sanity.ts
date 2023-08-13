import { createClient } from '@sanity/preview-kit/client'

const projectId = 'pv8y60vp'
const dataset = 'production'
const apiVersion = '2022-11-15'
const useCdn = false
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
})

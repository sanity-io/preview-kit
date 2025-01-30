import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2025-03-04'
const useCdn = true
const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:3333'
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
  stega: {
    enabled: true,
    studioUrl,
    logger: console,
  },
})

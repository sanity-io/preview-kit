// Used by .github/workflows/simulate-high-traffic.yml

import {createClient} from '@sanity/client'
import {updateDocuments} from './benchmark'

const minutes = Number(process.env.MINUTES) || 15
const batch = Number(process.env.BATCH) || 10
const token = process.env.SANITY_API_WRITE_TOKEN

const client = createClient({
  projectId: 'pv8y60vp',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token,
})

updateDocuments(client as unknown as any, minutes, batch).catch(console.error)

import {defineEnableDraftMode} from 'next-sanity/draft-mode'
import {createClient} from 'next-sanity'
import {token} from '../../../sanity.fetch'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-03-04',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
})

export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token}),
})

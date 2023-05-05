/* eslint-disable no-process-env */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'
export const useCdn = false

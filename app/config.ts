/* eslint-disable no-process-env */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'production'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'pv8y60vp'
export const useCdn = false
export const apiVersion = '2022-11-10'

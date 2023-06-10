export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pv8y60vp'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
// export const apiVersion =
//   process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2022-11-15'
// @TODO remove this after `perspective` is GA
export const apiVersion = 'X'
export const useCdn = false
export const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
}

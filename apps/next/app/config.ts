/* eslint-disable no-process-env */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'production'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'pv8y60vp'
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2022-11-15'
export const useCdn = false

type PreviewVariant =
  | 'cookie'
  | 'token'
  | 'hydration'
  | 'token-edge'
  | 'cookie-edge'
  | 'hydration-edge'
export type PreviewSlug = `next${12 | 13}-${PreviewVariant}`
export const previewSlug = (slug: PreviewSlug): PreviewSlug => {
  switch (slug) {
    case 'next12-cookie':
    case 'next12-token':
    case 'next12-hydration':
    case 'next13-cookie':
    case 'next13-token':
    case 'next13-hydration':
    case 'next13-cookie-edge':
    case 'next13-token-edge':
      return slug

    default:
      throw new Error(`Unknown preview: ${slug}`)
  }
}

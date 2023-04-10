export const projectId =
  typeof document === 'undefined'
    ? process.env.SANITY_API_PROJECT_ID
    : window?.ENV?.projectId
export const dataset =
  typeof document === 'undefined'
    ? process.env.SANITY_API_DATASET
    : window?.ENV?.dataset
export const apiVersion =
  typeof document === 'undefined'
    ? process.env.SANITY_API_VERSION
    : window?.ENV?.apiVersion
export const useCdn = true

type PreviewVariant = 'cookie' | 'token'
export type PreviewSlug = `remix-${PreviewVariant}`
export const previewSlug = (slug: PreviewSlug): PreviewSlug => {
  switch (slug) {
    case 'remix-cookie':
    case 'remix-token':
      return slug

    default:
      throw new Error(`Unknown preview: ${slug}`)
  }
}

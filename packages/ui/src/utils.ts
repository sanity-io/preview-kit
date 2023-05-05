export type RouteSlug = 'cookie' | 'token' | 'hydration'
export const routeSlug = (slug: RouteSlug | string | null): RouteSlug => {
  switch (slug) {
    case 'cookie':
    case 'token':
    case 'hydration':
      return slug

    default:
      throw new Error(`Unknown route: ${slug}`)
  }
}

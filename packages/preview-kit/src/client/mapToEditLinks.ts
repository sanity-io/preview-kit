import { mapToEditLinks as CSMMapToEditLinks } from '../csm/mapToEditLinks'
import type { ContentSourceMapQueryResponse } from './types'

/**
 * @deprecated Please use `resolveEditUrl` from `@sanity/preview-kit/csm` instead
 */
export function mapToEditLinks(
  response: ContentSourceMapQueryResponse,
  studioUrl: string,
): unknown {
  return CSMMapToEditLinks(
    response.result,
    response.resultSourceMap!,
    studioUrl,
  )
}

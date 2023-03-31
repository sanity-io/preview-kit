import { defineEditLink } from './editIntent'
import { encodeIntoResult } from './sourcemap'
import type { ContentSourceMapQueryResponse } from './types'

/** @alpha */
export function mapToEditLinks(
  response: ContentSourceMapQueryResponse,
  studioUrl: string
): unknown {
  const createEditLink = defineEditLink(studioUrl)
  return encodeIntoResult(response, (_, sourceDocument, path) => {
    return createEditLink(sourceDocument, path)
  })
}

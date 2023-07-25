import type { ContentSourceMap } from '@sanity/client'

import { defineEditLink } from './editIntent'
import { encodeIntoResult } from './sourcemap'

/** @alpha */
export function mapToEditLinks<R>(
  result: R,
  csm: ContentSourceMap,
  studioUrl: string,
): R {
  const createEditLink = defineEditLink(studioUrl)
  return encodeIntoResult(result, csm, (_, sourceDocument, path) => {
    return createEditLink(sourceDocument, path)
  }) as R
}

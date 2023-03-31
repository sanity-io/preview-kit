import {
  ContentSourceMapDocument,
  ContentSourceMapDocuments,
} from '@sanity/client'

import { parseNormalisedJsonPath } from './jsonpath'
import type { PathSegment, StudioUrl } from './types'

/** @alpha */
export type EditLink = `/intent/edit/id=${string};path=${string}`
/** @alpha */
export interface EditLinkProps {
  studioUrl: StudioUrl
  document: ContentSourceMapDocument
}
/** @alpha */
export type DefineEditLink = (
  studioUrl: StudioUrl
) => (
  sourceDocument: ContentSourceMapDocuments[number]
) => `${StudioUrl}${EditLink}`

/** @alpha */
export function defineEditLink(
  _studioUrl: StudioUrl
): (
  sourceDocument: ContentSourceMapDocuments[number],
  path: string | PathSegment[]
) => string {
  const studioUrl = _studioUrl.replace(/\/$/, '')
  return (sourceDocument, path) =>
    `${studioUrl}/intent/edit/id=${
      sourceDocument._id
    };path=${encodeJsonPathToUriComponent(path)}`
}

/** @alpha */
export function encodeJsonPathToUriComponent(
  path: string | PathSegment[]
): string {
  const sourcePath = Array.isArray(path) ? path : parseNormalisedJsonPath(path)
  return encodeURIComponent(
    sourcePath
      .map((key, i) =>
        // eslint-disable-next-line no-nested-ternary
        typeof key === 'number' ? `[${key}]` : i > 0 ? `.${key}` : key
      )
      .join('')
  )
}

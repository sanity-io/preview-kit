import {
  type ContentSourceMapDocuments,
  createEditIntentLink,
  type PathSegment,
  type StudioUrl,
} from '@sanity/client/csm'

export function defineEditLink(
  studioUrl: StudioUrl,
): (
  sourceDocument: ContentSourceMapDocuments[number],
  path: string | PathSegment[],
) => string {
  return (sourceDocument, path) =>
    createEditIntentLink(studioUrl, sourceDocument, path)
}

/* eslint-disable no-nested-ternary */
import {
  type ContentSourceMap,
  type ContentSourceMapDocuments,
  type PathSegment,
  resolveMapping,
  walkMap,
} from '@sanity/client/csm'

import { parseJsonPath } from './jsonpath'

/** @alpha */
export type Encoder<E> = (
  value: string,
  sourceDocument: ContentSourceMapDocuments[number],
  path: PathSegment[],
) => E

/** @alpha */
export function encode<R, E>(
  result: R,
  csm: ContentSourceMap,
  encoder: Encoder<E>,
  options?: { keyArraySelectors: boolean },
): R {
  return encodeIntoResult(result, csm, encoder, options) as R
}

/** @alpha */
export function encodeIntoResult<R>(
  result: R,
  csm: ContentSourceMap,
  encoder: Encoder<unknown>,
  options?: { keyArraySelectors: boolean },
): ReturnType<Encoder<unknown>> {
  return walkMap(result, (value, path) => {
    // Only map strings, we could extend this in the future to support other types like integers...
    if (typeof value !== 'string') {
      return value
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const resolveMappingResult = resolveMapping(path, csm)
    if (!resolveMappingResult) {
      return value
    }

    const [mapping, matchedPath, pathSuffix] = resolveMappingResult
    if (mapping.type !== 'value') {
      return value
    }

    if (mapping.source.type !== 'documentValue') {
      return value
    }

    const sourceDocument =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      csm.documents[mapping.source.document!]
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sourcePath = csm.paths[mapping.source.path]

    if (options?.keyArraySelectors) {
      const matchPathSegments = parseJsonPath(matchedPath)
      const sourcePathSegments = parseJsonPath(sourcePath)
      const fullSourceSegments = sourcePathSegments.concat(
        path.slice(matchPathSegments.length),
      )

      return encoder(value, sourceDocument, fullSourceSegments)
    }

    return encoder(
      value,
      sourceDocument,
      parseJsonPath(sourcePath + pathSuffix),
    )
  })
}

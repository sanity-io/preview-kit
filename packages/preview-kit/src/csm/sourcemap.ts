/* eslint-disable no-nested-ternary */
import type {
  ContentSourceMap,
  ContentSourceMapDocuments,
  ContentSourceMapMapping,
} from '@sanity/client'

import { jsonPath, parseJsonPath } from './jsonpath'
import type { Logger, PathSegment } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isArray(value: unknown): value is Array<unknown> {
  return value !== null && Array.isArray(value)
}

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
      const fullSourceSegments = sourcePathSegments.concat(path.slice(matchPathSegments.length))

      return encoder(
        value,
        sourceDocument,
        fullSourceSegments,
      )
    }

    return encoder(
      value,
      sourceDocument,
      parseJsonPath(sourcePath + pathSuffix),
    )
  })
}

export type WalkMapFn = (value: unknown, path: PathSegment[]) => unknown

/** generic way to walk a nested object or array and apply a mapping function to each value
 * @alpha
 */
export function walkMap(
  value: unknown,
  mappingFn: WalkMapFn,
  path: PathSegment[] = [],
): unknown {
  if (isArray(value)) {
    return value.map((v, idx) => {
      if (isRecord(v)) {
        const key = v['_key']
        if (typeof key === 'string') {
          return walkMap(v, mappingFn, path.concat({ key, index: idx }))
        }
      }

      return walkMap(v, mappingFn, path.concat(idx))
    })
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        walkMap(v, mappingFn, path.concat(k)),
      ]),
    )
  }

  return mappingFn(value, path)
}

/** @alpha */
export function resolveMapping(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
  logger?: Logger,
): [ContentSourceMapMapping, string, string] | undefined {
  const resultJsonPath = jsonPath(resultPath)

  if (!csm.mappings) {
    logger?.error?.('Missing mappings', {
      resultSourceMap: csm,
    })
    return undefined
  }

  if (csm.mappings[resultJsonPath] !== undefined) {
    return [csm.mappings[resultJsonPath], resultJsonPath, '']
  }

  const mappings = Object.entries(csm.mappings)
    .filter(([key]) => resultJsonPath.startsWith(key))
    .sort(([key1], [key2]) => key2.length - key1.length)

  if (mappings.length == 0) {
    return undefined
  }

  const [matchedPath, mapping] = mappings[0]
  const pathSuffix = resultJsonPath.substring(matchedPath.length)
  return [mapping, matchedPath, pathSuffix]
}

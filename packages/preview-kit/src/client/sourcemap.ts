/* eslint-disable no-nested-ternary */
import type {
  ContentSourceMap,
  ContentSourceMapDocuments,
  ContentSourceMapMapping,
} from '@sanity/client'

import { normalisedJsonPath } from './jsonpath'
import type {
  ContentSourceMapQueryResponse,
  Logger,
  PathSegment,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isArray(value: unknown): value is Array<unknown> {
  return value !== null && Array.isArray(value)
}

/** @alpha */
export type Encoder = (
  value: string,
  sourceDocument: ContentSourceMapDocuments[number],
  path: string
) => unknown

/** @alpha */
export function encode(
  response: ContentSourceMapQueryResponse,
  encoder: Encoder
): ContentSourceMapQueryResponse {
  if (!response.resultSourceMap) {
    throw new TypeError('Missing resultSourceMap')
  }

  response.result = encodeIntoResult(response, encoder)
  return response
}

/** @alpha */
export function encodeIntoResult(
  response: ContentSourceMapQueryResponse,
  encoder: Encoder
): ReturnType<Encoder> {
  return walkMap(response.result, (value, path) => {
    // Only map strings, we could extend this in the future to support other types like integers...
    if (typeof value !== 'string') {
      return value
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const resolveMappingResult = resolveMapping(path, response.resultSourceMap!)
    if (!resolveMappingResult) {
      return value
    }

    const [mapping, , pathSuffix] = resolveMappingResult
    if (mapping.type !== 'value') {
      return value
    }

    if (mapping.source.type !== 'documentValue') {
      return value
    }

    const sourceDocument =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      response.resultSourceMap!.documents[mapping.source.document!]
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sourcePath = response.resultSourceMap!.paths[mapping.source.path]

    return encoder(value, sourceDocument, sourcePath + pathSuffix)
  })
}

export type WalkMapFn = (value: unknown, path: PathSegment[]) => unknown

// generic way to walk a nested object or array and apply a mapping function to each value
export function walkMap(
  value: unknown,
  mappingFn: WalkMapFn,
  path: PathSegment[] = []
): unknown {
  if (isArray(value)) {
    return value.map((v, idx) => walkMap(v, mappingFn, path.concat(idx)))
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        walkMap(v, mappingFn, path.concat(k)),
      ])
    )
  }

  return mappingFn(value, path)
}

export function resolveMapping(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
  logger?: Logger
): [ContentSourceMapMapping, string, string] | undefined {
  const resultJsonPath = normalisedJsonPath(resultPath)

  if (!csm.mappings) {
    logger?.error('Missing resultSourceMap.mappings', { resultSourceMap: csm })
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

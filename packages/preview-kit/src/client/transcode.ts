/* eslint-disable no-nested-ternary */
import type { ContentSourceMapDocuments } from '@sanity/client'
import { vercelStegaEncode } from '@vercel/stega'

import { defineEditLink } from './editIntent'
import { parseNormalisedJsonPath } from './jsonpath'
import { encode } from './sourcemap'
import type {
  ContentSourceMapQueryResponse,
  Logger,
  PathSegment,
} from './types'
import type { FilterDefault, PreviewKitClientConfig } from './types'

const filterDefault: FilterDefault = ({ path }) => {
  const endPath = path.at(-1)
  // Never encode slugs
  if (path.at(-2) === 'slug' && endPath === 'current') {
    return false
  }

  // Skip underscored keys, needs better heuristics but it works for now
  if (typeof endPath === 'string' && endPath.startsWith('_')) {
    return false
  }

  // Don't encode style keys for portable text
  if (typeof path.at(-2) === 'number' && endPath === 'style') {
    return false
  }

  return true
}

export type Transcoder = (
  input: string,
  sourceDocument: ContentSourceMapDocuments[number],
  sourcePath: PathSegment[]
) => string

const TRUNCATE_LENGTH = 20

/**
 * @internal
 */
export function createTranscoder(
  studioUrl: PreviewKitClientConfig['studioUrl'],
  encodeSourceMapAtPath?: PreviewKitClientConfig['encodeSourceMapAtPath'],
  logger?: Logger
): {
  report: Record<
    'encoded' | 'skipped',
    { path: string; length: number; value: string }[]
  >
  transcode: Transcoder
  walk: (input: ContentSourceMapQueryResponse) => ContentSourceMapQueryResponse
} {
  const createEditLink = defineEditLink(studioUrl)
  const report: Record<
    'encoded' | 'skipped',
    { path: string; length: number; value: string }[]
  > = { encoded: [], skipped: [] }

  const transcode = (
    input: string,
    sourceDocument: ContentSourceMapDocuments[number],
    sourcePath: PathSegment[]
  ): string => {
    // Allow userland to control when to opt-out of encoding
    if (
      (typeof encodeSourceMapAtPath === 'function'
        ? encodeSourceMapAtPath({ path: sourcePath, filterDefault })
        : filterDefault({ path: sourcePath, filterDefault })) === false
    ) {
      if (logger) {
        report.skipped.push({
          path: JSON.stringify(sourcePath),
          value: `${input.slice(0, TRUNCATE_LENGTH)}${
            input.length > TRUNCATE_LENGTH ? '...' : ''
          }`,
          length: input.length,
        })
      }
      return input
    }

    if (logger) {
      report.encoded.push({
        path: JSON.stringify(sourcePath),
        value: `${input.slice(0, TRUNCATE_LENGTH)}${
          input.length > TRUNCATE_LENGTH ? '...' : ''
        }`,
        length: input.length,
      })
    }

    return `${vercelStegaEncode({
      origin: 'sanity.io',
      href: createEditLink(sourceDocument, sourcePath),
    })}${input}`
  }
  return {
    report,
    transcode,
    walk: (input: ContentSourceMapQueryResponse) => {
      // Clear previous reports
      report.encoded.length = 0
      report.skipped.length = 0
      // Start the recursive machinery
      return encode(input, (value, sourceDocument, path) =>
        transcode(value, sourceDocument, parseNormalisedJsonPath(path))
      )
    },
  }
}

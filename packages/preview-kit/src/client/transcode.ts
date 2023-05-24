/* eslint-disable no-nested-ternary */
import type { ContentSourceMapDocuments } from '@sanity/client'
import { vercelStegaCombine } from '@vercel/stega'

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

  /**
   * Best effort infer Portable Text paths that should not be encoded.
   * Nothing is for certain, and the below implementation may cause paths that aren't Portable Text and otherwise be safe to encode to be skipped.
   * However, that's ok as userland can always opt-in with the `encodeSourceMapAtPath` option and mark known safe paths as such, which will override this heuristic.
   */
  // If the path ends in [number].children[number].marks[number] it's likely a PortableTextSpan: https://github.com/portabletext/types/blob/e54eb24f136d8efd51a46c6a190e7c46e79b5380/src/portableText.ts#LL154C16-L154C16
  if (
    typeof endPath === 'number' &&
    path.at(-2) === 'marks' &&
    typeof path.at(-3) === 'number' &&
    path.at(-4) === 'children' &&
    typeof path.at(-5) === 'number'
  ) {
    return false
  }
  // Or if it's [number].markDefs[number].href it's likely a PortableTextLink: https://github.com/portabletext/types/blob/e54eb24f136d8efd51a46c6a190e7c46e79b5380/src/portableText.ts#L163
  if (
    endPath === 'href' &&
    typeof path.at(-2) === 'number' &&
    path.at(-3) === 'markDefs' &&
    typeof path.at(-4) === 'number'
  ) {
    return false
  }
  // Otherwise we have to deal with special properties of PortableTextBlock, and we can't confidently know if it's actually a `_type: 'block'` array item or not.
  // All we know is that if it is indeed a block, and we encode the strings on these keys it'll for sure break the PortableText rendering and thus we skip encoding.
  if (typeof endPath === 'string' && typeof path.at(-2) === 'number') {
    // https://github.com/portabletext/types/blob/e54eb24f136d8efd51a46c6a190e7c46e79b5380/src/portableText.ts#L48-L58
    if (endPath === 'style' || endPath === 'listItem') {
      return false
    }
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
          path: prettyPathForLogging(sourcePath),
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
        path: prettyPathForLogging(sourcePath),
        value: `${input.slice(0, TRUNCATE_LENGTH)}${
          input.length > TRUNCATE_LENGTH ? '...' : ''
        }`,
        length: input.length,
      })
    }

    return vercelStegaCombine(
      input,
      {
        origin: 'sanity.io',
        href: createEditLink(sourceDocument, sourcePath),
      },
      'auto'
    )
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

function prettyPathForLogging(path: PathSegment[]): string {
  return path
    .map((segment, index) =>
      typeof segment === 'number'
        ? `[${segment}]`
        : index > 0
        ? `.${segment}`
        : segment
    )
    .join('')
}

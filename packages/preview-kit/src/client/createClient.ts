import {
  createClient as createStandardClient,
  SanityClient,
} from '@sanity/client'
import {
  createClient as createStegaClient,
  SanityStegaClient,
} from '@sanity/client/stega'

import type { FilterDefault, PreviewKitClientConfig } from './types'

export type * from './types'
export type * from '@sanity/client'

/**
 * @public
 * @deprecated - migrate to `@sanity/client/stega`
 */
export const createClient = (
  config: PreviewKitClientConfig,
): SanityClient | SanityStegaClient => {
  const {
    encodeSourceMap = detectEnableSourceMap(),
    encodeSourceMapAtPath,
    studioUrl = detectStudioUrl(),
    logger,
    ...options
  } = config

  let shouldEncodeSourceMap = encodeSourceMap === true

  // If encodeSourceMap is set to 'auto', then we need to check if we're running on Vercel and on a preview deployment
  if (encodeSourceMap === 'auto') {
    shouldEncodeSourceMap = isVercelPreviewEnvironment()
  }

  if (typeof encodeSourceMap === 'string' && encodeSourceMap !== 'auto') {
    throw new Error(
      `Invalid value for encodeSourceMap: ${encodeSourceMap}. Did you mean 'auto'?`,
    )
  }

  try {
    if (shouldEncodeSourceMap && config.resultSourceMap !== false) {
      if (!studioUrl) {
        logger?.error?.(
          '[@sanity/preview-kit]: Content source map enabled client is enabled, but no studioUrl is provided. Falling back to @sanity/client',
        )
        return createStandardClient(options)
      }

      logger?.debug?.(
        '[@sanity/preview-kit]: Creating source map enabled client',
      )
      return createStegaClient({
        ...options,
        // Source maps by Content Lake are required in order to know where to insert the encoded source maps into strings
        resultSourceMap: config.resultSourceMap
          ? config.resultSourceMap
          : 'withKeyArraySelector',
        stega: {
          enabled: true,
          studioUrl,
          logger,
          filter: encodeSourceMapAtPath
            ? ({ sourcePath }) =>
                encodeSourceMapAtPath({
                  path: sourcePath,
                  filterDefault: ({ path }) =>
                    filterDefault({ path, filterDefault }),
                })
            : undefined,
        },
      })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      '[@sanity/preview-kit]: Error creating client',
      err,
      'falling back to non-embedded sourcemap mode',
    )
  }
  return createStandardClient(options)
}

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

function isVercelPreviewEnvironment() {
  try {
    // @ts-expect-error -- VERCEL_ENV is not a declared import.meta.env variable
    return import.meta.env.VERCEL_ENV === 'preview'
  } catch {
    // ignore
  }
  try {
    // eslint-disable-next-line no-process-env
    return process.env.VERCEL_ENV === 'preview'
  } catch {
    // ignore
  }
  return false
}

function detectEnableSourceMap(): PreviewKitClientConfig['encodeSourceMap'] {
  try {
    // @ts-expect-error -- SANITY_SOURCE_MAP is not a declared import.meta.env variable
    return import.meta.env.SANITY_SOURCE_MAP === 'true' || 'auto'
  } catch {
    // ignore
  }
  try {
    // eslint-disable-next-line no-process-env
    return process.env.SANITY_SOURCE_MAP === 'true' || 'auto'
  } catch {
    // ignore
  }
  return 'auto'
}

// eslint-disable-next-line consistent-return
function detectStudioUrl() {
  try {
    // @ts-expect-error -- SANITY_STUDIO_URL is not a declared import.meta.env variable
    return import.meta.env.SANITY_STUDIO_URL
  } catch {
    // ignore
  }
  try {
    // eslint-disable-next-line no-process-env
    return process.env.SANITY_STUDIO_URL
  } catch {
    // ignore
  }
}

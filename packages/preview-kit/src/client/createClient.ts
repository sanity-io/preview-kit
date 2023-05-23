import { createClient as _createClient, SanityClient } from '@sanity/client'

import { createHttpRequest } from './request'
import type { PreviewKitClientConfig } from './types'

export type * from './mapToEditLinks'
export { mapToEditLinks } from './mapToEditLinks'
export type * from './types'
export type * from '@sanity/client'

/**
 * @alpha
 */
export const createClient = (config: PreviewKitClientConfig): SanityClient => {
  const {
    encodeSourceMap = detectEnableSourceMap(),
    studioUrl = detectStudioUrl(),
    logger,
  } = config

  let shouldEncodeSourceMap = encodeSourceMap === true

  // If encodeSourceMap is set to 'auto', then we need to check if we're running on Vercel and on a preview deployment
  if (encodeSourceMap === 'auto') {
    shouldEncodeSourceMap = isVercelPreviewEnvironment()
  }

  try {
    if (shouldEncodeSourceMap && config.resultSourceMap !== false) {
      logger?.debug('[@sanity/preview-kit]: Creating source map enabled client')
      const httpRequest = createHttpRequest({ ...config, studioUrl })
      return new SanityClient(httpRequest, {
        ...config,
        // Source maps by Content Lake are required in order to know where to insert the encoded source maps into strings
        resultSourceMap: true,
      })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      '[@sanity/preview-kit]: Error creating client',
      err,
      'falling back to non-embedded sourcemap mode'
    )
  }
  return _createClient(config)
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

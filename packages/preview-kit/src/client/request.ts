/**
 * Creates a custom `httpRequest` handler for `SanityClient`, that
 * includes a middleware that handles source maps and stega encoding.
 */
import {
  type HttpRequest,
  requester as originalRequester,
  type RequestOptions,
} from '@sanity/client'
import isPlainObject from 'lodash.isplainobject'
import invariant from 'tiny-invariant'

import { createTranscoder } from './transcode'
import type {
  ContentSourceMapQueryResponse,
  PreviewKitClientConfig,
} from './types'

type TranscodeResponseConfig = Pick<
  PreviewKitClientConfig,
  'studioUrl' | 'encodeSourceMapAtPath' | 'logger'
>

function transcodeResponse({
  studioUrl,
  encodeSourceMapAtPath,
  logger,
}: TranscodeResponseConfig) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const transcoder = createTranscoder(studioUrl, encodeSourceMapAtPath, logger!)
  return {
    onResponse: (response: unknown) => {
      if (!isBodyResponse(response)) {
        return response
      }

      if (
        Array.isArray(response.body) ||
        typeof response.body === 'string' ||
        isPlainObject(response.body)
      ) {
        if (!isContentSourceMapBody(response.body)) {
          if (logger) {
            logger?.error(
              '[@sanity/preview-kit]: Missing Content Source Map from response body',
              response.body
            )
          }
          return response
        }

        const body = transcoder.walk(response.body)

        if (logger) {
          const isSkipping = transcoder.report.skipped.length
          const isEncoding = transcoder.report.encoded.length
          if (isSkipping || isEncoding) {
            logger?.groupCollapsed(
              '[@sanity/preview-kit]: Stega encoding source map into result'
            )
            logger?.log(
              `[@sanity/preview-kit]: Paths encoded: ${transcoder.report.encoded.length}, skipped: ${transcoder.report.skipped.length}`
            )
          }
          if (transcoder.report.encoded.length > 0) {
            logger?.log(`[@sanity/preview-kit]: Table of encoded paths`)
            logger?.table(transcoder.report.encoded)
          }
          if (transcoder.report.skipped.length > 0) {
            const skipped = new Set<string>()
            for (const { path } of transcoder.report.skipped) {
              skipped.add(path.replace(/\[\d+\]/g, '[]'))
            }
            logger?.log(`[@sanity/preview-kit]: List of skipped paths`, [
              ...skipped.values(),
            ])
          }

          if (isSkipping || isEncoding) {
            logger?.groupEnd()
          }
        }

        return { ...response, body }
      }

      return response
    },
  }
}

/** @internal */
export function createHttpRequest({
  studioUrl,
  encodeSourceMapAtPath,
  logger,
}: PreviewKitClientConfig): HttpRequest {
  invariant(studioUrl, 'Missing studioUrl in client config')
  const superRequester = originalRequester.clone()

  // Apply the transcoder middleware
  superRequester.use(
    transcodeResponse({ studioUrl, encodeSourceMapAtPath, logger })
  )

  function httpRequest(
    options: RequestOptions,
    requester = superRequester
  ): HttpRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return requester({ maxRedirects: 0, ...options } as any)
  }

  httpRequest.defaultRequester = superRequester

  return httpRequest
}

function isBodyResponse(response: unknown): response is { body?: unknown } {
  return typeof response === 'object' && response !== null
}

/** @alpha */
export function isContentSourceMapBody(
  body: unknown
): body is ContentSourceMapQueryResponse {
  return typeof body === 'object' && body !== null && 'resultSourceMap' in body
}

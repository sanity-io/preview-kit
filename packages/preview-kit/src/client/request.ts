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

import { createTranscoder } from '../csm/transcode'
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
  const transcoder = createTranscoder({
    studioUrl: studioUrl!,
    encodeSourceMapAtPath,
    logger: logger!,
  })
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
          if (logger && !isResultBody(response.body)) {
            logger?.error?.(
              '[@sanity/preview-kit]: Missing Content Source Map from response body',
              response.body,
            )
          }
          return response
        }

        const transcoderResult = transcoder(
          response.body.result,
          response.body.resultSourceMap!,
        )

        if (logger) {
          const isSkipping = transcoderResult.report.skipped.length
          const isEncoding = transcoderResult.report.encoded.length
          if (isSkipping || isEncoding) {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;(logger?.groupCollapsed || logger.log)?.(
              '[@sanity/preview-kit]: Stega encoding source map into result',
            )
            logger.log?.(
              `[@sanity/preview-kit]: Paths encoded: ${transcoderResult.report.encoded.length}, skipped: ${transcoderResult.report.skipped.length}`,
            )
          }
          if (transcoderResult.report.encoded.length > 0) {
            logger?.log?.(`[@sanity/preview-kit]: Table of encoded paths`)
            ;(logger?.table || logger.log)?.(transcoderResult.report.encoded)
          }
          if (transcoderResult.report.skipped.length > 0) {
            const skipped = new Set<string>()
            for (const { path } of transcoderResult.report.skipped) {
              skipped.add(path.replace(/\[\d+\]/g, '[]'))
            }
            logger?.log?.(`[@sanity/preview-kit]: List of skipped paths`, [
              ...skipped.values(),
            ])
          }

          if (isSkipping || isEncoding) {
            logger?.groupEnd?.()
          }
        }

        const body = {
          ...response.body,
          result: transcoderResult.result,
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
}: Pick<
  PreviewKitClientConfig,
  'studioUrl' | 'encodeSourceMapAtPath' | 'logger'
>): HttpRequest {
  invariant(studioUrl, 'Missing studioUrl in client config')
  const superRequester = originalRequester.clone()

  // Apply the transcoder middleware
  superRequester.use(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- support the improved get-it typings
    transcodeResponse({ studioUrl, encodeSourceMapAtPath, logger }) as any,
  )

  function httpRequest(
    options: RequestOptions,
    requester = superRequester,
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
export function isResultBody(
  body: unknown,
): body is ContentSourceMapQueryResponse {
  return typeof body === 'object' && body !== null && 'result' in body
}

/** @alpha */
export function isContentSourceMapBody(
  body: unknown,
): body is ContentSourceMapQueryResponse {
  return typeof body === 'object' && body !== null && 'resultSourceMap' in body
}

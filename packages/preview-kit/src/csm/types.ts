import type {
  ContentSourceMap,
  ContentSourceMapParsedPathKeyedSegment,
} from '@sanity/client/csm'

/**
 * @deprecated Please use `import {InitializedStegaConfig} from @sanity/client/stega` instead
 */
export interface CreateTranscoderConfig {
  /**
   * Where the Studio is hosted.
   * If it's embedded in the app, use the base path for example `/studio`.
   * Otherwise provide the full URL to where the Studio is hosted, for example: `https://blog.sanity.studio`.
   *
   * @alpha
   */
  studioUrl: StudioUrl

  /**
   * Some strings shouldn't be encoded, for example if you store internal URLs the stega characters will break routing.
   * ```ts
    {
      encodeSourceMapAtPath: (props) => {
        switch (props.path.at(-1)) {
          case 'url':
            return false
          default:
            return props.filterDefault(props)
        }
      }
    }
   * ```
   * @alpha
   */
  encodeSourceMapAtPath?: FilterDefault

  /**
   * Specify a `console.log` compatible logger to see debug logs, which keys are encoded and which are not.
   *
   * @alpha
   */
  logger?: Logger
}

/** @deprecated */
export type PathSegment =
  | string
  | number
  | ContentSourceMapParsedPathKeyedSegment

/** @deprecated */
export type StudioUrl =
  | `/${string}`
  | `${string}.sanity.studio`
  | `https://${string}`
  | string

/** @deprecated */
export type FilterDefault = (props: {
  path: PathSegment[]
  filterDefault: FilterDefault
}) => boolean

export type Logger =
  | typeof console
  | Partial<
      Pick<
        typeof console,
        'debug' | 'error' | 'groupCollapsed' | 'groupEnd' | 'log' | 'table'
      >
    >

/** @deprecated */
export type Transcoder = <R>(
  result: R,
  csm: ContentSourceMap,
) => TranscoderResult<R>

/** @deprecated */
export type TranscoderResult<R> = {
  result: R
  report: Record<
    'encoded' | 'skipped',
    { path: string; length: number; value: string }[]
  >
}

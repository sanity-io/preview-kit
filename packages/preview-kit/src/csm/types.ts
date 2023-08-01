import type { ContentSourceMap } from '@sanity/client'

/** @public */
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

/** @public */
export type PathSegment = string | number

/** @public */
export type StudioUrl =
  | `/${string}`
  | `${string}.sanity.studio`
  | `https://${string}`
  | string

/** @public */
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

/** @public */
export type Transcoder = <R>(
  result: R,
  csm: ContentSourceMap,
) => TranscoderResult<R>

/** @public */
export type TranscoderResult<R> = {
  result: R
  report: Record<
    'encoded' | 'skipped',
    { path: string; length: number; value: string }[]
  >
}

import type { ContentSourceMap } from '@sanity/client'

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

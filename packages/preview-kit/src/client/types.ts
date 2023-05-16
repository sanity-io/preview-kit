import type { ClientConfig } from '@sanity/client'
import type { RawQueryResponse } from '@sanity/client'

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
  | Pick<
      typeof console,
      'debug' | 'error' | 'groupCollapsed' | 'groupEnd' | 'log' | 'table'
    >

/** @public */
export type ContentSourceMapQueryResponse =
  | RawQueryResponse<unknown>
  | Pick<RawQueryResponse<unknown>, 'result' | 'resultSourceMap'>

export interface PreviewKitClientConfig extends ClientConfig {
  /**
     * Some strings shouldn't be encoded, for example if you store internal URLs the stega characters will break routing.
     * ```ts
      createClient({
        encodeSourceMapAtPath: (props) => {
          switch (props.path.at(-1)) {
            case 'url':
              return false
            default:
              return props.filterDefault(props)
          }
        }
      })
     * ```
     * @alpha
     */
  encodeSourceMapAtPath?: FilterDefault
  /**
   * Whether to encode source maps in the result, using steganography.
   * - 'auto'
   *   if the environment is detected to be on Vercel and in a preview deployment, then it's true.
   * - true
   *   forces encoding of sourcemaps using `'stega'` encoding, regardless of environment.
   * - false
   *   disables encoding of sourcemaps, regardless of environment.
   * @defaultValue import.meta.env.SANITY_SOURCE_MAP || process.env.SANITY_SOURCE_MAP || 'auto'
   * @alpha
   */
  encodeSourceMap?: 'auto' | true | false
  /**
   * Where the Studio is hosted.
   * If it's embedded in the app, use the base path for example `/studio`.
   * Otherwise provide the full URL to where the Studio is hosted, for example: `https://blog.sanity.studio`.
   *
   * You can use the following snippet in your browser devtools to get the Studio URL if it's externally hosted:
   * ```ts
   * async function getStudioURL(projectId) {
   *     const { createClient } = await import('https://esm.sh/@sanity/client');
   *     const client = createClient({ withCredentials: true, useProjectHostname: false });
   *     const project = await client.projects.getById(projectId);
   *     try {
   *         const url = new URL(project.metadata.externalStudioHost);
   *         return `${url.origin}${url.pathname}`;
   *     } catch {
   *         return new URL(`https://${project.studioHost}.sanity.studio`).toString();
   *     }
   * }
   *
   * await getStudioURL('3do82whm')
   * ```
   * Or as a Node.js script:
   *```ts
   * const {createClient} = require("@sanity/client");
   * async function getStudioURL(token, projectId) {
   *     const client = createClient({ token, useProjectHostname: false });
   *     const project = await client.projects.getById(projectId);
   *     try {
   *         const url = new URL(project.metadata.externalStudioHost);
   *         return `${url.origin}${url.pathname}`;
   *     } catch {
   *         return new URL(`https://${project.studioHost}.sanity.studio`).toString();
   *     }
   * }
   *
   * await getStudioURL(process.env.SANITY_API_TOKEN, '3do82whm')
   *```
   * @defaultValue import.meta.env.SANITY_STUDIO_URL || process.env.SANITY_STUDIO_URL
   * @alpha
   */
  studioUrl: StudioUrl
  /**
   * Specify a `console.log` compatible logger to see debug logs, which keys are encoded and which are not.
   * @alpha
   */
  logger?: Logger
}

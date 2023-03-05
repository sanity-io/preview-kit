import type { Config, GroqStore } from '@sanity/groq-store'
import type { EventSourcePolyfill } from 'event-source-polyfill'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { suspend } from 'suspend-react'

import { _checkAuth } from './auth'
import { _lazyEventSourcePolyfill, _lazyGroqStore } from './lazy'

/**
 * The params type used both in `@sanity/client`:
 * ```tsx
 * import {createClient} from '@sanity/client'
 *
 * const client = createClient()
 * await client.fetch(
 *   '*[_type == "post"]',
 *   params // <-- this is the type
 * )
 * ```
 * It's also used with the `usePreview` hook returned by `definePreview`:
 * ```tsx
 * import {definePreview} from '@sanity/preview-kit'
 * const usePreview = definePreview()
 * usePreview(
 *   token,
 *   '*[_type == "post"]',
 *   params // <-- this is the type
 * )
 * ```
 * @public
 */
export type Params = Record<string, unknown>

/**
 * @internal
 */
export interface _PreviewConfig extends PreviewConfig {
  /**
   * Lazy load `@sanity/groq-store`.
   */
  importGroqStore: () => (config: Config) => GroqStore
  /**
   * Lazy load `event-source-polyfille`.
   * This happens if `token` is specified.
   */
  importEventSourcePolyfill: () => EventSourcePolyfill
  /**
   * Suspend render until the dataset is done loading.
   */
  preload: <R = any, P extends Params = Params, Q extends string = string>(
    store: GroqStore,
    query: Q,
    /**
     * Must wrap in `useMemo` to avoid infinite loop
     */
    params?: P
  ) => R
  /**
   * Only called if `onPublicAccessOnly` is defined. Render is suspended until this Promise resolves to a boolean.
   */
  checkAuth: (projectId: string, token: string | null) => boolean
}

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
function useParams<P extends Params = Params>(params?: P): P {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params]
  )
  return useMemo(() => JSON.parse(stringifiedParams), [stringifiedParams])
}

/**
 * @internal
 */
export const _definePreview = ({
  projectId,
  dataset,
  documentLimit = 3000,
  subscriptionThrottleMs = 10,
  overlayDrafts = true,
  importEventSourcePolyfill,
  importGroqStore,
  preload,
  onPublicAccessOnly,
  checkAuth,
  includeTypes,
}: _PreviewConfig): UsePreview => {
  if (!projectId) {
    console.warn(`No projectId set for createPreviewHook, returning dummy hook`)
    // No projectId set, just return a dummy hook and warn
    const usePreview: UsePreview = function usePreview() {
      console.warn(
        `The hook returned by createPreviewHook is a dummy as there is no projectId set, returning null`
      )
      return null
    }
    return usePreview
  }

  let store: ReturnType<typeof import('@sanity/groq-store').groqStore>
  return function usePreview<
    R = any,
    P extends Params = Params,
    Q extends string = string
  >(
    token: string | null,
    query: Q,
    _params?: P,
    _serverSnapshot?: R
  ): R | null {
    if (typeof document === 'undefined') {
      throw new Error(
        `Calling usePreview outside a browser environment isn't supported. Ensure the component using the hook is only rendering on the client. For example by wrapping it in PreviewSuspense.`
      )
    }
    if (!token && token !== null) {
      throw new Error(
        'No `token` given to usePreview hook, if this is intentional then set it to `null`'
      )
    }
    const [serverSnapshot] = useState<R | undefined>(() => _serverSnapshot)

    const params = useParams<P>(_params)

    if (!store) {
      if (onPublicAccessOnly) {
        const hasAuth = checkAuth(projectId, token)
        if (!hasAuth) {
          onPublicAccessOnly()
        }
      }

      // Lazy load `@sanity/groq-store` as it's quite a big chunk of JS`
      const groqStore = importGroqStore()

      store = groqStore({
        projectId,
        dataset,
        documentLimit,
        subscriptionThrottleMs,
        includeTypes,
        token: token === null ? undefined : token,
        // Lazy load the huge `event-source-polyfill`, but only if a token is specified
        EventSource: token === null ? undefined : importEventSourcePolyfill(),
        listen: true,
        overlayDrafts,
      })
    }

    const initial = serverSnapshot ?? preload<R, P, Q>(store, query, params)
    const syncStore = useMemo(() => {
      // Make sure that React suspends the component until the groq store is finished loading the dataset and able to execute the query
      let snapshot = initial

      return {
        getServerSnapshot:
          serverSnapshot === undefined ? undefined : () => serverSnapshot,
        getSnapshot: () => snapshot,
        subscribe: (onStoreChange: () => void) => {
          const subscription = store.subscribe(
            query,
            typeof params === 'undefined' ? {} : params,
            (err, result) => {
              if (err) {
                console.error(
                  'Error thrown in the usePreviewHook subscription',
                  err
                )
                throw err
              } else {
                snapshot = result
                onStoreChange()
              }
            }
          )

          return () => subscription.unsubscribe()
        },
      }
    }, [initial, params, query, serverSnapshot])

    useEffect(() => {
      const callback = () => {
        store.close()
      }
      window.addEventListener('beforeunload', callback)
      return () => window.removeEventListener('beforeunload', callback)
    }, [])

    return useSyncExternalStore(
      syncStore.subscribe,
      syncStore.getSnapshot,
      syncStore.getServerSnapshot
    )
  }
}

/**
 * @public
 */
export type UsePreview<R = any, P = Params, Q = string> = (
  token: string | null,
  query: Q,
  params?: P,
  /**
   * Providing a serverSnapshot significantly speeds up hydration time and lets you opt-in to not show loading UI
   */
  serverSnapshot?: R
) => R

/**
 * @public
 */
export interface PreviewConfig
  extends Pick<
    Config,
    'projectId' | 'dataset' | 'includeTypes' | 'overlayDrafts'
  > {
  /**
   * The maximum number of documents, to prevent using too much memory unexpectedly
   * Throws on the first operation (query, retrieval, subscription) if reaching this limit.
   * @defaultValue 3000
   */
  documentLimit?: number
  /**
   * Throttle the event emits to batch updates. If you have a lot of editors changing content at the same time it might help to increase this value to reduce the amount of rerenders React have to perform.
   * @defaultValue 10
   */
  subscriptionThrottleMs?: number
  /**
   * You want to throw an error in this function if it's considered a failure if draft documents can't be queried.
   *
   * Without a `token` then the dataset export will attempt to use reuse the user token by setting `credentials: "include" when calling fetch()`.
   * This only works with the `cookie` auth model you find in Sanity Studio. It doesn't work in browsers that require `cookieless` to login, such as iOS Safari and more.
   * Currently the only way to fix this is to define a `token` that has `viewer` rights in your project.
   * It's not recommended to rely on auth at the moment as it limits the use of previews to Chromium based browsers and users that have a Sanity account in the project.
   * If you still want to use the `cookie` auth model you'll want to throw an error if the user don't have a cookie based session established. If this method is undefined, the default, it'll only query published, public, documents.
   * ```tsx
   * import {definePreview} from '@sanity/preview-kit'
   * const usePreview = definePreview({
   *  onPublicAccessOnly: () => {
   *   throw new Error('Not authenticated - preview not available')
   * })
   * ```
   *
   * If you're building a preview experience that doesn't query drafts then you can just leave this function undefined.
   *
   * Enabling this will slightly slow-down startup as it will wait with exporting the dataset until it has checked if you have a cookie session.
   * This check is done by calling `https://${projectId}.api.sanity.io/v1/users/me` with fetch() and `credentials: "include"`.
   * If `token` is set it'll set `headers: {Authorization: "Bearer ${token}"}` instead.
   * But if you're already setting `token` you can skip defining this function to run startup faster, if the `token` is invalid it'll throw while exporting the dataset anyway.
   */
  onPublicAccessOnly?: () => void
  /**
   * @defaultValue true
   */
  overlayDrafts?: boolean
}

/**
 * @internal
 */
export const _preloadQuery = <R = any>(
  store: GroqStore,
  query: string,
  params?: Params
): Promise<R> =>
  // eslint-disable-next-line no-warning-comments
  // @todo: fix the casting to any here
  store.query<R>(query, params)

/**
 * @public
 */
export const definePreview = (config: PreviewConfig): UsePreview =>
  _definePreview({
    ...config,
    importEventSourcePolyfill: () =>
      suspend(
        () => _lazyEventSourcePolyfill(),
        ['@sanity/preview-kit', 'event-source-polyfill']
      ),
    importGroqStore: () =>
      suspend(
        () => _lazyGroqStore(),
        ['@sanity/preview-kit', '@sanity/groq-store']
      ),
    preload: (store, query, params) =>
      suspend(
        () => _preloadQuery<any>(store, query, params),
        ['@sanity/preview-kit', 'preload', query, JSON.stringify(params ?? {})]
      ),
    checkAuth: (projectId, token) =>
      suspend(
        () => _checkAuth(projectId, token),
        ['@sanity/preview-kit', 'checkAuth', projectId, token]
      ),
  })

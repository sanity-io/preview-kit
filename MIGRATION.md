- [Upgrading from v5 to v6](#upgrading-from-v5-to-v6)
- [Upgrading from v1 to v2](#upgrading-from-v1-to-v2)

# Upgrading from v5 to v6

## `refreshInterval` is now removed

This is a side-effect from v6 adopting the [Live Content API](https://www.sanity.io/live) under the hood. On any change the API notifies which queries to refetch, thus there's zero need to do any polling. With no polling, the `refreshInterval` option no longer has any effect.

## `@sanity/preview-kit/client` is changed

It now re-exports `@sanity/client`, migrating has minor changes for most use cases:

```diff
import {createClient} from '@sanity/preview-kit/client'

const client = createClient({
  // ...base config options
- encodeSourceMap: process.env.VERCEL_ENV === 'preview',
+ stega: {
+   enabled: process.env.VERCEL_ENV === 'preview',
    studioUrl: '/studio',
+ }
})
```

The `stega.enabled` option doesn't have any magic equivalent to `encodeSourceMap: "auto"`, which is the default behavior in `@sanity/preview-kit/client` in v5. You'll have to implement the environment variable checks yourself:

```diff
import {createClient} from '@sanity/preview-kit/client'

const client = createClient({
  // ...base config options
- encodeSourceMap: 'auto', // 'auto' is the default option
+ stega: {
+   enabled: process.env.SANITY_SOURCE_MAP === 'true' || process.env.VERCEL_ENV === 'preview',
+   studioUrl: process.env.SANITY_STUDIO_URL,
+ }
})
```

The `logger` option is moved to the `stega` group:

```diff
const client = createClient({
  // ...base config options
+ stega: {
    logger: console,
+ }
})
```

The `encodeSourceMapAtPath` is also moved, and has a new signature. You can re-use the same logic as before by adding a small wrapper:

```diff
import {createClient} from '@sanity/preview-kit/client'

function customFilterLogic({path, filterDefault}) {
  // ...
}

const client = createClient({
  // ...base config options
- encodeSourceMapAtPath: customFilterLogic,
+ stega: {
+   filter: (props) =>
+     customFilterLogic({
+       path: props.sourcePath,
+       filterDefault: () => props.filterDefault(props),
+     })
+ }
})
```

# Upgrading from v1 to v2

## `usePreview` is now `useLiveQuery`

The signature of `usePreview` is:

```tsx
function usePreview<QueryResult = any, QueryParams = Record<string, unknown>, QueryString = string>(
  token: string | null,
  query: QueryString,
  params?: QueryParams,
  serverSnapshot?: QueryResult,
): QueryResult | null
```

While the signature of `useLiveQuery` is:

```tsx
import type {QueryParams as ClientQueryParams} from '@sanity/client'

type QueryLoading = boolean

function useLiveQuery<QueryResult, QueryParams = ClientQueryParams>(
  initialData: QueryResult,
  query: string,
  params?: QueryParams,
  options?: {
    isEqual?: (a: QueryResult, b: QueryResult) => boolean
  },
): [QueryResult, QueryLoading]
```

The main differences between the two hooks are:

- `token` is no longer a hook argument, it's now provided by the `LiveQueryProvider` component.
- generics are adjusted to match the behavior of `@sanity/client`'s `client.fetch` method.
- `serverSnapshot` is now called `initialData` and is required. It's still used as the return value for a `getServerSnapshot` in the underlying `useSyncExternalStore` during SSR hydration to ensure you don't get mismatch errors.
- It no longer returns `null` during the initial render. Instead, it returns `initialData` until the dataset export is finished and it's safe to run queries.
- `PreviewSuspense` is no longer needed, instead you use `initialData` to implement either a `stale-while-revalidate` pattern or a fallback UI.

## `definePreview` and `PreviewSuspense` are replaced by `<LiveQueryProvider />`

The simplified signature for `definePreview` is:

```tsx
import type { Config } from '@sanity/groq-store'

export interface PreviewConfig extends Omit<Config, 'token'> {
  onPublicAccessOnly?: () => void
}

const usePreview = definePreview(config: PreviewConfig)
```

While the signature for `<LiveQueryProvider />` is:

```tsx
import type {SanityClient} from '@sanity/client'

export interface LiveQueryProviderProps {
  children: React.ReactNode
  client: SanityClient
  logger?: typeof console
  cache?: {
    /** @defaultValue 3000 */
    maxDocuments?: number
    includeTypes?: string[]
    /** @defaultValue true */
    listen?: boolean
  }
  /** @defaultValue 10000 */
  refreshInterval?: number
  /** @defaultValue true */
  turboSourceMap?: boolean
}

export function LiveQueryProvider(props: LiveQueryProviderProps): React.JSX.Element
```

The main differences between the two APIs are:

- `LiveQueryProvider` is a React component, while `definePreview` is a top-level function call.
- `definePreview` omits the `token` argument and instead requires you to pass it to the `usePreview` hook, while `LiveQueryProvider` handles `token` as part of the `client` instance.
- A `Suspense` boundary is only required if you use `React.lazy` to code-split your app, otherwise it's optional.
- The `onPublicAccessOnly` API is removed to speed up startup time by eliminating a waterfall of requests. Instead, it throws an error, and you can use a `ReactErrorBoundary` to handle it.
- `LiveQueryProvider` is optional, when omitted the `useLiveQuery` hooks will fall back to a no-op mode, where it'll return `initialData` so it's safe to use in production.

## Migrating a component with a `stale-while-revalidate` pattern to the new hook

Here's what a typical migration looks like, to keep the guide simple more advanced patterns like `React.lazy` are omitted:

```tsx
import {createClient, type SanityClient} from '@sanity/client'
import type {LoaderArgs} from '@vercel/remix'
import {useLoaderData} from '@remix-run/react'
import {definePreview, PreviewSuspense} from '@sanity/preview-kit'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export function getClient({preview}: {preview?: {token: string}}): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-03-04',
    useCdn: true,
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective: 'drafts',
    })
  }
  return client
}

export async function loader({request}: LoaderArgs) {
  const token = process.env.SANITY_API_READ_TOKEN
  const preview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? {token} : undefined
  const client = getClient({preview})

  const data = await client.fetch<number>(query)

  return {preview, data}
}

export default function CountPage() {
  const {preview, data} = useLoaderData<typeof loader>()

  const children = <Count data={data} />

  return (
    <>
      {preview ? (
        <PreviewSuspense fallback={children}>
          <PreviewCount token={preview.token} />
        </PreviewSuspense>
      ) : (
        children
      )}
    </>
  )
}

const Count = ({data}: {data: number}) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview: UsePreview<number> = definePreview({projectId, dataset})
const PreviewCount = ({token}) => {
  const data = usePreview(token, query)
  return <Count data={data!} />
}
```

After migration, it looks like this:

```tsx
import {useMemo} from 'react'
import createClient from '@sanity/client'
import type {LoaderArgs} from '@vercel/remix'
import {useLoaderData} from '@remix-run/react'
import {useLiveQuery, LiveQueryProvider} from '@sanity/preview-kit'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export function getClient({preview}: {preview?: {token: string}}): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-03-04',
    useCdn: true,
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective: 'drafts',
    })
  }
  return client
}

export async function loader({request}: LoaderArgs) {
  const token = process.env.SANITY_API_READ_TOKEN
  const preview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? {token} : undefined
  const client = getClient({preview})

  const data = await client.fetch<number>(query)

  return {preview, data}
}

export default function CountPage() {
  const {preview, data} = useLoaderData<typeof loader>()

  const children = <Count data={data} />

  return (
    <>{preview ? <PreviewProvider token={preview.token}>{children}</PreviewProvider> : children}</>
  )
}

const Count = ({data: initialData}: {data: number}) => {
  const [data] = useLiveQuery(initialData, query)
  return (
    <>
      Documents: <strong>{data}</strong>
    </>
  )
}

function PreviewProvider({children, token}: {children: React.ReactNode; token: string}) {
  const client = useMemo(() => getClient({preview: {token}}), [token])
  return <LiveQueryProvider client={client}>{children}</LiveQueryProvider>
}
```

## Migrating with a component using a Spinner fallback instead of `stale-while-revalidate`

In this example a Spinner is displayed until groq-store is booted up and skips fetching data server side to speed up startup time.

```tsx
import createClient from '@sanity/client'
import type {LoaderArgs} from '@vercel/remix'
import {useLoaderData} from '@remix-run/react'
import {definePreview, PreviewSuspense} from '@sanity/preview-kit'

import Spinner from '~/Spinner'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export function getClient({preview}: {preview?: {token: string}}): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-03-04',
    useCdn: true,
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective: 'drafts',
    })
  }
  return client
}

export async function loader({request}: LoaderArgs) {
  const token = process.env.SANITY_API_READ_TOKEN
  const preview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? {token} : undefined
  const client = getClient({preview})

  const data = preview ? null : await client.fetch<number>(query)

  return {preview, data}
}

export default function CountPage() {
  const {preview, data} = useLoaderData<typeof loader>()

  return (
    <>
      {preview ? (
        <PreviewSuspense fallback={<Spinner />}>
          <PreviewCount token={preview.token} />
        </PreviewSuspense>
      ) : (
        <Count data={data} />
      )}
    </>
  )
}

const Count = ({data}: {data: number}) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview: UsePreview<number> = definePreview({projectId, dataset})
const PreviewCount = ({token}) => {
  const data = usePreview(token, query)
  return <Count data={data!} />
}
```

After migration, it looks like this:

```tsx
import createClient from '@sanity/client'
import type {LoaderArgs} from '@vercel/remix'
import {useLoaderData} from '@remix-run/react'
import {useLiveQuery, LiveQueryProvider} from '@sanity/preview-kit'

import Spinner from '~/Spinner'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export function getClient({preview}: {preview?: {token: string}}): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-03-04',
    useCdn: true,
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective: 'drafts',
    })
  }
  return client
}

export async function loader({request}: LoaderArgs) {
  const token = process.env.SANITY_API_READ_TOKEN
  const preview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? {token} : undefined
  const client = getClient({preview})

  const data = preview ? null : await client.fetch<number>(query)

  return {preview, data}
}

export default function CountPage() {
  const {preview, data} = useLoaderData<typeof loader>()

  return (
    <>
      {preview ? (
        <PreviewProvider token={preview.token}>
          <Count data={data} />
        </PreviewProvider>
      ) : (
        <Count data={data} />
      )}
    </>
  )
}

const Count = ({data: initialData}: {data: number | null}) => {
  const [data, loading] = useLiveQuery(initialData, query)

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      Documents: <strong>{data}</strong>
    </>
  )
}

function PreviewProvider({children, token}: {children: React.ReactNode; token: string}) {
  const client = useMemo(() => getClient({preview: {token}}), [token])
  return <LiveQueryProvider client={client}>{children}</LiveQueryProvider>
}
```

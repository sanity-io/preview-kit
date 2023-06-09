# Upgrading from v1 to v2

## `usePreview` is now `useListeningQuery`

The signature of `usePreview` is:

```tsx
function usePreview<
  QueryResult = any,
  QueryParams = Record<string, unknown>,
  QueryString = string
>(
  token: string | null,
  query: QueryString,
  params?: QueryParams,
  serverSnapshot?: QueryResult
): QueryResult | null
```

While the signature of `useListeningQuery` is:

```tsx
import type { QueryParams as ClientQueryParams } from '@sanity/client'

function useListeningQuery<QueryResult, QueryParams = ClientQueryParams>(
  initialSnapshot: QueryResult,
  query: string,
  queryParams?: QueryParams,
  options?: {
    isEqual?: (a: QueryResult, b: QueryResult) => boolean
  }
): QueryResult
```

The main differences between the two hooks are:

- `token` is no longer a hook argument, it's now provided by the `GroqStoreProvider` component.
- generics are adjusted to match the behavior of `@sanity/client`'s `client.fetch` method.
- `serverSnapshot` is now called `initialSnapshot` and is required. It's still used as the return value for a `getServerSnapshot` in the underlying `useSyncExternalStore` during SSR hydration to ensure you don't get mismatch errors.
- It no longer might return `null` during initial render, instead it returns `initialSnapshot` until the dataset export is finished and it's safe to run queries.
- `PreviewSuspense` is no longer needed, instead you use `initialSnapshot` to imeplemt either a stale-while-revalidate pattern or a fallback UI.

## `definePreview` and `PreviewSuspense` are replaced by `<GroqStoreProvider />`

The simplified signature for `definePreview` is:

```tsx
import type { Config } from '@sanity/groq-store'

export interface PreviewConfig extends Omit<Config, 'token'> {
  onPublicAccessOnly?: () => void
}

const usePreview = definePreview(config: PreviewConfig)
```

While the signature for `<GroqStoreProvider />` is:

```tsx
import { type Config } from '@sanity/groq-store'

export interface GroqStoreProviderProps extends Config {
  children: React.ReactNode
}

export function GroqStoreProvider(
  props: GroqStoreProviderProps
): React.JSX.Element
```

The main differences between the two APIs are:

- `GroqStoreProvider` is a React component, while `definePreview` is a top-level function call.
- `definePreview` omits the `token` argument and instead requires you to pass it to the `usePreview` hook, while `GroqStoreProvider` handles `token` so the hooks don't need to.
- A `Suspense` boundary is only required if you use `React.lazy` to code-split your app, otherwise it's optional.
- `GroqStoreProvider` exposes the same underlying `@sanity/groq-store` options, as props on the component.
- The `onPublicAccessOnly` API is removed, to speed up startup time by eliminating a waterfall of requests, it'll throw an error instead and you can use a `ReactErrorBoundary` to handle it.
- `GroqStoreProvider` is optional, when omitted the `useListeningQuery` hooks will fall back to a no-op mode, where it'll return `initialSnapshot` so it's safe to use in production.

## Migrating a component with a `stale-while-revalidate` pattern to the new hook

Here's what a typical migration looks like, to keep the guide simple more advanced patterns like `React.lazy` are omitted:

```tsx
import { createClient, type SanityClient } from '@sanity/client'
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'
import { definePreview, PreviewSuspense } from '@sanity/preview-kit'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export const getClient = (preview = false) =>
  createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    useCdn: !preview,
    token: preview ? process.env.SANITY_API_READ_TOKEN : undefined,
  })

export async function loader({ request }: LoaderArgs) {
  const isPreview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true'
  const client = getClient(isPreview)

  const data = await client.fetch<number>(query)
  const preview = isPreview
    ? { token: client.config().token }
    : (false as const)

  return { preview, data }
}

export default function CountPage() {
  const { preview, data } = useLoaderData<typeof loader>()

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

const Count = ({ data }: { data: number }) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview: UsePreview<number> = definePreview({ projectId, dataset })
const PreviewCount = ({ token }) => {
  const data = usePreview(token, query)
  return <Count data={data!} />
}
```

After migration it looks like this:

```tsx
import createClient from '@sanity/client'
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'
import { useListeningQuery } from '@sanity/preview-kit'
import { GroqStoreProvider } from '@sanity/preview-kit/groq-store'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export const getClient = (preview = false) =>
  createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    useCdn: !preview,
    token: preview ? process.env.SANITY_API_READ_TOKEN : undefined,
  })

export async function loader({ request }: LoaderArgs) {
  const isPreview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true'
  const client = getClient(isPreview)

  const data = await client.fetch<number>(query)
  const preview = isPreview
    ? { token: client.config().token }
    : (false as const)

  return { preview, data }
}

export default function CountPage() {
  const { preview, data } = useLoaderData<typeof loader>()

  const children = <Count data={data} />

  return (
    <>
      {preview ? (
        <GroqStoreProvider
          projectId={projectId}
          dataset={dataset}
          token={preview.token}
        >
          {children}
        </GroqStoreProvider>
      ) : (
        children
      )}
    </>
  )
}

const Count = ({ data: serverSnapshot }: { data: number }) => {
  const data = useListeningQuery(serverSnapshot, query)
  return (
    <>
      Documents: <strong>{data}</strong>
    </>
  )
}
```

## Migrating with a component using a Spinner fallback instead of `stale-while-revalidate`

In this example a Spinner is displayed until groq-store is booted up and skips fetching data server side to speed up startup time.

```tsx
import createClient from '@sanity/client'
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'
import { definePreview, PreviewSuspense } from '@sanity/preview-kit'

import Spinner from '~/Spinner'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export const getClient = (preview = false) =>
  createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    useCdn: !preview,
    token: preview ? process.env.SANITY_API_READ_TOKEN : undefined,
  })

export async function loader({ request }: LoaderArgs) {
  const isPreview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true'
  const client = getClient(isPreview)

  if (isPreview) {
    return { preview: { token: client.config().token }, data: null }
  }

  const data = await client.fetch<number>(query)
  return { preview: false as const, data }
}

export default function CountPage() {
  const { preview, data } = useLoaderData<typeof loader>()

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

const Count = ({ data }: { data: number }) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview: UsePreview<number> = definePreview({ projectId, dataset })
const PreviewCount = ({ token }) => {
  const data = usePreview(token, query)
  return <Count data={data!} />
}
```

After migration it looks like this:

```tsx
import createClient from '@sanity/client'
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'
import { useListeningQuery } from '@sanity/preview-kit'
import { GroqStoreProvider } from '@sanity/preview-kit/groq-store'

import Spinner from '~/Spinner'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = `count(*[])`

export const getClient = (preview = false) =>
  createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    useCdn: !preview,
    token: preview ? process.env.SANITY_API_READ_TOKEN : undefined,
  })

export async function loader({ request }: LoaderArgs) {
  const isPreview = process.env.SANITY_API_PREVIEW_DRAFTS === 'true'
  const client = getClient(isPreview)

  if (isPreview) {
    return { preview: { token: client.config().token }, data: null }
  }

  const data = await client.fetch<number>(query)
  return { preview: false as const, data }
}

export default function CountPage() {
  const { preview, data } = useLoaderData<typeof loader>()

  return (
    <>
      {preview ? (
        <GroqStoreProvider
          projectId={projectId}
          dataset={dataset}
          token={preview.token}
        >
          <PreviewCount />
        </GroqStoreProvider>
      ) : (
        <Count data={data} />
      )}
    </>
  )
}

const Count = ({ data }: { data: number }) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const isLoadingCount = Symbol('isLoadingCount')
const PreviewCount = () => {
  const snapshot = useListeningQuery(isLoadingCount, query)

  if (snapshot === isLoadingCount) {
    return <Spinner />
  }

  return <Count data={snapshot} />
}
```

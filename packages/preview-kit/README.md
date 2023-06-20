# @sanity/preview-kit<!-- omit in toc -->

[Sanity.io](https://www.sanity.io/?utm_source=github&utm_medium=readme&utm_campaign=preview-kit) toolkit for building live-as-you-type content preview experiences and visual editing.

- [Installation](#installation)
- [`@sanity/preview-kit/client` Visual Editing with Content Source Maps](#sanitypreview-kitclient)
- [`@sanity/preview-kit` Live real-time preview for React](#sanitypreview-kit-1)
- [Release new version](#release-new-version)
- [License](#license)

# Installation

```bash
npm i @sanity/preview-kit @sanity/client
```

```bash
pnpm i @sanity/preview-kit @sanity/client
```

```bash
yarn add @sanity/preview-kit @sanity/client
```

# `@sanity/preview-kit/client`

## Visual Editing with Content Source Maps

> **Note**
>
> [Content Source Maps][content-source-maps-intro] are available [as an API][content-source-maps] for select [Sanity enterprise customers][enterprise-cta]. [Contact our sales team for more information.][sales-cta]

You can use [visual editing][visual-editing-intro] with any framework, not just React. [Read our guide for how to get started.][visual-editing]

### `createClient`

The Preview Kit client is built on top of `@sanity/client` and is designed to be a drop-in replacement. It extends the client configuration with options for customizing visual editing experiences.

```diff
-import {createClient, type ClientConfig} from '@sanity/client'
+import { createClient, type ClientConfig } from '@sanity/preview-kit/client'

const config: ClientConfig = {
  projectId: 'your-project-id',
  dataset: 'your-dataset-name',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version

- // enable content source map in the response
- resultSourceMap: true,
+ // Required, set it to the URL of your Sanity Studio
+ studioUrl: 'https://your-project-name.sanity.studio',
+ // enable content source map in the response, and encode it into strings
+ // 'auto' is the default, you can also use `true` or `false`
+ encodeSourceMap: 'auto',
}

const client = createClient(config)
```

#### `studioUrl`

It's **required**, and can either be an absolute URL:

```ts
import { createClient } from '@sanity/preview-kit/client'

const client = createClient({
  ...config,
  studioUrl: 'https://your-company.com/studio',
})
```

Or a relative path if the Studio is hosted on the same deployment, or embedded in the same app:

```ts
import { createClient } from '@sanity/preview-kit/client'

const client = createClient({
  ...config,
  studioUrl: '/studio',
})
```

#### `encodeSourceMap`

Accepts `"auto"`, the default, or a `boolean`. Controls when to encode the content source map into strings using `@vercel/stega` encoding. When `"auto"` is used a best-effort environment detection is used to see if the environment is a Vercel Preview deployment. Most of the time it works out of the box, but in some scenarios and some frameworks it might be necessary to run custom logic, equivalent to:

```tsx
import { createClient } from '@sanity/preview-kit/client'

const client = createClient({
  ...config,
  encodeSourceMap: process.env.VERCEL_ENV === 'preview',
})
```

#### `encodeSourceMapAtPath`

By default source maps are encoded into all strings that can be traced back to a document field, except for URLs and ISO dates. We also make some exceptions for fields like, `document._type`, `document._id` and `document.slug.current`, that we've seen leading to breakage if the string is altered as well as for Portable Text.

You can customize this behavior using `encodeSourceMapAtPath`:

```tsx
import { createClient } from '@sanity/preview-kit/client'

const client = createClient({
  ...config,
  encodeSourceMapAtPath: (props) => {
    if (props.path[0] === 'externalUrl') {
      return false
    }
    // The default behavior is packaged into `filterDefault`, allowing you enable encoding fields that are skipped by default
    return props.filterDefault(props)
  },
})
```

#### `logger`

Pass a `console` into `logger` to get detailed debug info and reports on which fields are encoded and which are skipped:

```tsx
import { createClient } from '@sanity/preview-kit/client'

const client = createClient({
  ...config,
  logger: console,
})
```

An example report:

```bash
[@sanity/preview-kit]: Creating source map enabled client
[@sanity/preview-kit]: Stega encoding source map into result
  [@sanity/preview-kit]: Paths encoded: 3, skipped: 17
  [@sanity/preview-kit]: Table of encoded paths
  ┌─────────┬──────────────────────────────┬───────────────────────────┬────────┐
  │ (index) │              path            │           value           │ length │
  ├─────────┼──────────────────────────────┼───────────────────────────┼────────┤
  │    0    │ "footer[0].children[0].text" │ '"The future is alrea...' │   67   │
  │    1    │ "footer[1].children[0].text" │     'Robin Williams'      │   14   │
  │    2    │            "title"           │     'Visual Editing'      │   14   │
  └─────────┴──────────────────────────────┴───────────────────────────┴────────┘
  [@sanity/preview-kit]: List of skipped paths [
    'footer[]._key',
    'footer[].children[]._key',
    'footer[].children[]._type',
    'footer[]._type',
    'footer[].style',
    '_type',
    'slug.current',
  ]
```

#### `resultSourceMap`

This option is always enabled if `encodeSourceMap`. It's exposed here to be [compatible with `@sanity/client`](https://github.com/sanity-io/client/#get-started-with-content-source-maps) and custom use cases where you want content source maps, but not the encoding.

```ts
const client = createClient({
  ...config,
  // This option can only enable content source maps, not disable it when `encodeSourceMap` resolves to `true`
  resultSourceMap: true,
})

const { result, resultSourceMap } = await client.fetch(query, params, {
  filterResponse: false,
})

console.log(resultSourceMap) // `resultSourceMap` is now available, even if `encodeSourceMap` is `false`
```

## Using the Content Source Map with custom logic

If you're building your own custom preview logic you can use `mapToEditLinks` to skip encoding hidden metadata into strings, and access the edit links directly:

```tsx
import { createClient, mapToEditLinks } from '@sanity/preview-kit/client'

const client = createClient({
  ...config,
  resultSourceMap: true, // Tells Content Lake to include content source maps in the response
  encodeSourceMap: false, // Disable the default encoding behavior
})

// const result = await client.fetch(query, params)
const { result, resultSourceMap } = await client.fetch(
  query,
  params,
  { filterResponse: false } // This option is returns the entire API response instead of selecting just `result`
)
const studioUrl = 'https://your-company.com/studio'
const editLinks = mapToEditLinks({ result, resultSourceMap }, studioUrl)

const title = result.title
const titleEditLink = editLinks.title

console.log(title, titleEditLink)
```

# `@sanity/preview-kit`

> **Note**
>
> This is the new docs for `@sanity/preview-kit` v2. If you're looking for docs for v1 APIs, like `definePreview` and `usePreview`, they're available [on the v1 branch.](https://github.com/sanity-io/preview-kit/tree/v1#readme).
>
> There's a full migration guide available [here.][migration]
>
> If you're looking for React Server Component and Next.js docs, [they're in the `next-sanity` readme.](https://github.com/sanity-io/next-sanity#readme)

## Live real-time preview for React

> **Note**
>
> The examples in this README use Remix, you can find Next.js specific examples in the [`next-sanity` README][next-sanity-readme]. Including information on how to build live previews in React Server Components with the new app-router.

Write GROQ queries like [@sanity/client](https://github.com/sanity-io/client) and have them resolve in-memory, locally. Updates from Content Lake are streamed in real-time with sub-second latency.

Requires React 18, support for other libraries like Solid, Svelte, Vue etc are planned. For now you can use [@sanity/groq-store](https://github.com/sanity-io/groq-store) [directly](https://github.com/sanity-io/groq-store/blob/main/example/example.ts).

Get started in 3 steps:

1. Create a `getClient` utility that returns a `@sanity/client` instance.
2. Define a `<LiveQueryProvider />` configuration.
3. Refactor the root layout of your app to conditionally wrap it in `<LiveQueryProvider />` when it's asked to preview drafts.
4. Use the `useLiveQuery` hook in components that you want to re-render in real-time as your documents are edited.

### 1. Create a `getClient` utility

As `<LiveQueryProvider />` is configured with a `@sanity/client` instance it makes sense to create a utility for it. Doing so makes it easy to ensure the server-side and client-side client are configured the same way.

`app/lib/sanity.ts`

```ts
import { createClient } from '@sanity/client'
import type { SanityClient } from '@sanity/client'

export function getClient({
  preview,
}: {
  preview?: { token: string }
}): SanityClient {
  const client = createClient({
    projectId: 'your-project-id',
    dataset: 'production',
    apiVersion: '2023-06-20',
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
    })
  }
  return client
}
```

### 2. Define a `<LiveQueryProvider />` component

Create a new file for the provider, so it can be loaded with `React.lazy` and avoid increasing the bundle size in production. Ensuring code needed for live previewing drafts are only loaded when needed.

`app/PreviewProvider.tsx`

```tsx
import { LiveQueryProvider } from '@sanity/preview-kit'
import { useMemo } from 'react'
import { getClient } from '~/lib/sanity'

export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  const client = useMemo(() => getClient({ preview: { token } }), [token])
  return <LiveQueryProvider client={client}>{children}</LiveQueryProvider>
}
```

Only the `client` prop is required. For debugging you can pass a `logger={console}` prop.

### 3. Making a Remix route conditionally preview draft

Here's the Remix route we'll be adding live preview of drafts, it's pretty basic:

```tsx
// app/routes/index.tsx
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'

import { getClient } from '~/lib/sanity'
import type { UsersResponse } from '~/UsersList'
import { UsersList, usersQuery } from '~/UsersList'
import { Layout } from '~/ui'

export async function loader({ request }: LoaderArgs) {
  const client = getClient({})
  const url = new URL(request.url)
  const lastId = url.searchParams.get('lastId') || ''

  const users = await client.fetch<UsersResponse>(usersQuery, { lastId })

  return { users, lastId }
}

export default function Index() {
  const { users, lastId } = useLoaderData<typeof loader>()

  return (
    <Layout>
      <UsersList data={users} lastId={lastId} />
    </Layout>
  )
}
```

Now let's import the `PreviewProvider` component we created in the previous step. To ensure we don't increase the production bundle size, we'll use `React.lazy` to code-split the component. The `React.lazy` API requires a `React.Suspense` boundary, so we'll add that too.

```tsx
import { lazy, Suspense } from 'react'

const PreviewProvider = lazy(() => import('~/PreviewProvider'))
```

Before we can add `<PreviewProvider />` to the layout we need to update the `loader` to include the props it needs. We'll use an environment variable called `SANITY_API_PREVIEW_DRAFTS` to control when to live preview drafts, and store a `viewer` API token in `SANITY_API_READ_TOKEN`.

Update the `const client = getClient({})` call to:

```tsx
const token = process.env.SANITY_API_READ_TOKEN
const preview =
  process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? { token } : undefined
const client = getClient({ preview })
```

Update the `loader` return statement from `return {users, lastId}` to:

```tsx
return { preview, users, lastId }
```

And add `preview` to `useLoaderData`:

```tsx
const { preview, users, lastId } = useLoaderData<typeof loader>()
```

Then make the render conditional based on wether `preview` is set:

```tsx
const children = <UsersList data={users} lastId={lastId} />

return (
  <Layout>
    {preview ? (
      <Suspense fallback={children}>
        <PreviewProvider token={preview.token}>{children}</PreviewProvider>
      </Suspense>
    ) : (
      children
    )}
  </Layout>
)
```

After putting everything together the route should now look like this:

```tsx
// app/routes/index.tsx
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'
import { lazy, Suspense } from 'react'

import { getClient } from '~/lib/sanity'
import type { UsersResponse } from '~/UsersList'
import { UsersList, usersQuery } from '~/UsersList'
import { Layout } from '~/ui'

const PreviewProvider = lazy(() => import('~/PreviewProvider'))

export async function loader({ request }: LoaderArgs) {
  const token = process.env.SANITY_API_READ_TOKEN
  const preview =
    process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? { token } : undefined
  const client = getClient({ preview })
  const url = new URL(request.url)
  const lastId = url.searchParams.get('lastId') || ''

  const users = await client.fetch<UsersResponse>(usersQuery, { lastId })

  return { preview, users, lastId }
}

export default function Index() {
  const { preview, users, lastId } = useLoaderData<typeof loader>()

  const children = <UsersList data={users} lastId={lastId} />

  return (
    <Layout>
      {preview ? (
        <Suspense fallback={children}>
          <PreviewProvider token={preview.token!}>{children}</PreviewProvider>
        </Suspense>
      ) : (
        children
      )}
    </Layout>
  )
}
```

### 4. Adding the `useLiveQuery` hook to components that need to re-render in real-time

Let's look at what the `<UsersList>` component looks like, before we add the hook:

```tsx
// app/UsersList.tsx
import groq from 'groq'

import { ListView, ListPagination } from '~/ui'

export const usersQuery = groq`{
  "list": *[_type == "user" && _id > $lastId] | order(_id) [0...20],
  "total": count(*[_type == "user"]),
}`

export interface UsersResponse {
  list: User[]
  total: number
}

export interface UsersListProps {
  data: UsersResponse
  lastId: string
}

export function UsersList(props: UsersListProps) {
  const { data, lastId } = props

  return (
    <>
      <ListView list={data.list} />
      <ListPagination total={data.total} lastId={lastId} />
    </>
  )
}
```

To make this component connect to your preview provider you need to add the `useLiveQuery`. You don't have to refactor your components so that the hook is only called when there's a parent `<LiveQueryProvider />`, it's safe to call it unconditionally.
If there's no `<LiveQueryProvider />` it behaves as if the hook had this implementation:

```tsx
export function useLiveQuery(initialData) {
  return [initialData, false]
}
```

Thus it's fairly easy to add conditional live preview capabilities to `UsersList`, simply add hook to your imports:

```tsx
import { useLiveQuery } from '@sanity/preview-kit'
```

And replace this:

```tsx
const { data, lastId } = props
```

With this:

```tsx
const { data: initialData, lastId } = props
const [data] = useLiveQuery(initialData, usersQuery, { lastId })
```

All together now:

```tsx
// app/UsersList.tsx
import { useLiveQuery } from '@sanity/preview-kit'
import groq from 'groq'

import { ListView, ListPagination } from '~/ui'

export const usersQuery = groq`{
  "list": *[_type == "user" && _id > $lastId] | order(_id) [0...20],
  "total": count(*[_type == "user"]),
}`

export interface UsersResponse {
  list: User[]
  total: number
}

export interface UsersListProps {
  data: UsersResponse
  lastId: string
}

export function UsersList(props: UsersListProps) {
  const { data: initialData, lastId } = props
  const [data] = useLiveQuery(initialData, usersQuery, { lastId })

  return (
    <>
      <ListView list={data.list} />
      <ListPagination total={data.total} lastId={lastId} />
    </>
  )
}
```

And done! You can optionally optimize it further by adding a loading UI while it loads, or improve performance by adding a custom `isEqual` function to reduce React re-renders if there's a lot of data that changes but isn't user visible (SEO metadata and such).

#### Implementing a Loading UI with `useLiveQuery`

The best way to do this is to add a wrapper component that is only used in preview mode that calls the `useLiveQuery` hook.

```tsx
export function UsersList(props: UsersListProps) {
  const { data, lastId } = props

  return (
    <>
      <ListView list={data.list} />
      <ListPagination total={data.total} lastId={lastId} />
    </>
  )
}

export function PreviewUsersList(props: UsersListProps) {
  const { data: initialData, lastId } = props
  const [data, loading] = useLiveQuery(initialData, usersQuery, { lastId })

  return (
    <>
      <PreviewStatus loading={loading} />
      <UsersList data={users} lastId={lastId} />
    </>
  )
}
```

Change the layout from:

```tsx
const children = <UsersList data={users} lastId={lastId} />

return (
  <Layout>
    {preview ? (
      <Suspense fallback={children}>
        <PreviewProvider token={preview.token!}>{children}</PreviewProvider>
      </Suspense>
    ) : (
      children
    )}
  </Layout>
)
```

To this:

```tsx
return (
  <Layout>
    {preview ? (
      <Suspense fallback={children}>
        <PreviewProvider token={preview.token!}>
          <PreviewUsersList data={users} lastId={lastId} />
        </PreviewProvider>
      </Suspense>
    ) : (
      <UsersList data={users} lastId={lastId} />
    )}
  </Layout>
)
```

#### Optimizing performance

Out of the box it'll only trigger a re-render of `UsersList` if the query response changed, using `react-fast-compare` under the hood. You can tweak this behavior by passing a custom `isEqual` function as the third argument to `useLiveQuery` if there's only some changes you want to trigger a re-render.

```tsx
const [data] = useLiveQuery(
  initialData,
  usersQuery,
  { lastId },
  {
    // Only re-render in real-time if user ids and names changed, ignore all other differences
    isEqual: (a, b) =>
      a.list.every((aItem, index) => {
        const bItem = b.list[index]
        return aItem._id === bItem._id && aItem.name === bItem.name
      }),
  }
)
```

You can also use the `React.useDeferredValue` hook and a `React.memo` wrapper to further optimize performance by letting React give other state updates higher priority than the preview updates. It prevents the rest of your app from slowing down should there be too much Studio activity for the previews to keep up with:

```tsx
import { memo, useDeferredValue } from 'react'

export function PreviewUsersList(props: UsersListProps) {
  const { data: initialData, lastId } = props
  const [snapshot] = useLiveQuery(initialData, usersQuery, { lastId })
  const data = useDeferredValue(snapshot)

  return <UsersList data={data} lastId={lastId} />
}

export const UsersList = memo(function UsersList(props: UsersListProps) {
  const { data, lastId } = props

  return (
    <>
      <ListView list={data.list} />
      <ListPagination total={data.total} lastId={lastId} />
    </>
  )
})
```

### Advanced usage

#### Fine-tuning `cache`

The defaults set for the `cache` prop are optimized for most use cases, but are conservative since the size of your documents can vary a lot. And your queries might only use some document types and it's not necessary to cache every type.
Thus you can fine-tune the cache by passing a custom `cache` prop to `LiveQueryProvider`:

```tsx
import { LiveQueryProvider } from '@sanity/preview-kit'

return (
  <LiveQueryProvider
    client={client}
    cache={{
      // default: 3000, increased to 10000 for this example app as each document is small
      maxDocuments: 10000,
      // The default cache includes all document types, you can reduce the amount of documents
      // by only including the ones you need.
      includeTypes: ['page', 'product', 'sanity.imageAsset'],
      // Turn off using a mutation EventSource listener, this means content updates will require a manual refresh
      listen: false
    }}
    // Passing a logger gives you more information on what to expect based on your configuration
    logger={console}
  >
    {children}
  </GroqStoreProvider>
)
```

## Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/preview-kit/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

# License

MIT-licensed. See [LICENSE](LICENSE).

[visual-editing]: https://www.sanity.io/docs/vercel-visual-editing?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch
[visual-editing-intro]: https://www.sanity.io/blog/visual-editing-sanity-vercel?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch
[content-source-maps]: https://www.sanity.io/docs/content-source-maps?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch
[content-source-maps-intro]: https://www.sanity.io/blog/content-source-maps-announce?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch
[sales-cta]: https://www.sanity.io/contact/sales?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch
[enterprise-cta]: https://www.sanity.io/enterprise?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch
[next-sanity-readme]: https://github.com/sanity-io/next-sanity#readme
[migration]: https://github.com/sanity-io/preview-kit/blob/main/MIGRATION.md

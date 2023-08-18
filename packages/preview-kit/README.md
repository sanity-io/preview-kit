# @sanity/preview-kit<!-- omit in toc -->

[Sanity.io](https://www.sanity.io/?utm_source=github&utm_medium=readme&utm_campaign=preview-kit) toolkit for building live-as-you-type content preview experiences and visual editing.

- [Installation](#installation)
- [`@sanity/preview-kit`](#sanitypreview-kit-1)
  - [Live real-time preview for React](#live-real-time-preview-for-react)
    - [1. Create a `client` instance](#1-create-a-client-instance)
    - [2. Define a `<LiveQueryProvider />` component](#2-define-a-livequeryprovider--component)
    - [3. Making a Remix route conditionally preview drafts](#3-making-a-remix-route-conditionally-preview-drafts)
    - [4. Adding the `useLiveQuery` hook to components that need to re-render in real-time](#4-adding-the-uselivequery-hook-to-components-that-need-to-re-render-in-real-time)
      - [Implementing a Loading UI with `useLiveQuery`](#implementing-a-loading-ui-with-uselivequery)
      - [Optimizing performance](#optimizing-performance)
    - [Advanced usage](#advanced-usage)
      - [Using the `LiveQuery` wrapper component instead of the `useLiveQuery` hook](#using-the-livequery-wrapper-component-instead-of-the-uselivequery-hook)
      - [Trouble-shooting and debugging](#trouble-shooting-and-debugging)
      - [Fine-tuning `cache`](#fine-tuning-cache)
      - [Content Source Map features](#content-source-map-features)
- [`@sanity/preview-kit/client`](#sanitypreview-kitclient)
  - [Visual Editing with Content Source Maps](#visual-editing-with-content-source-maps)
    - [Enhanced Sanity client with `createClient`](#enhanced-sanity-client-with-createclient)
      - [`studioUrl`](#studiourl)
      - [`encodeSourceMap`](#encodesourcemap)
      - [`encodeSourceMapAtPath`](#encodesourcemapatpath)
      - [`logger`](#logger)
      - [`resultSourceMap`](#resultsourcemap)
  - [Using the Content Source Map with custom logic](#using-the-content-source-map-with-custom-logic)
  - [Using Perspectives](#using-perspectives)
- [`@sanity/preview-kit/csm`](#sanitypreview-kitcsm)
  - [Transcoding](#transcoding)
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

1. Create a `client` instance of `@sanity/client` that can be shared on the server and browser.
2. Define a `<LiveQueryProvider />` configuration.
3. Refactor the root layout of your app to conditionally wrap it in `<LiveQueryProvider />` when it's asked to preview drafts.
4. Use the `useLiveQuery` hook in components that you want to re-render in real-time as your documents are edited.

### 1. Create a `client` instance

As `<LiveQueryProvider />` is configured with a `@sanity/client` instance it makes sense to create a utility for it. Doing so makes it easy to ensure the server-side and client-side client are configured the same way.

`app/lib/sanity.ts`

```ts
import { createClient } from '@sanity/client'
import type { QueryParams } from '@sanity/client'

// Shared on the server and the browser
export const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2023-06-20',
  useCdn: false,
  perspective: 'published',
})

// Only defined on the server, passed to the browser via a `loader`
export const token =
  typeof process === 'undefined' ? '' : process.env.SANITY_API_READ_TOKEN!

const DEFAULT_PARAMS = {} as QueryParams

// Utility for fetching data on the server, that can toggle between published and preview drafts
export async function sanityFetch<QueryResponse>({
  previewDrafts,
  query,
  params = DEFAULT_PARAMS,
}: {
  previewDrafts?: boolean
  query: string
  params?: QueryParams
}): Promise<QueryResponse> {
  if (previewDrafts && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    )
  }
  return client.fetch<QueryResponse>(
    query,
    params,
    previewDrafts
      ? {
          token,
          perspective: 'previewDrafts',
        }
      : {},
  )
}
```

### 2. Define a `<LiveQueryProvider />` component

Create a new file for the provider, so it can be loaded with `React.lazy` and avoid increasing the bundle size in production. Ensuring code needed for live previewing drafts are only loaded when needed.

`app/PreviewProvider.tsx`

```tsx
import { LiveQueryProvider } from '@sanity/preview-kit'
import { client } from '~/lib/sanity'

export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  if (!token) throw new TypeError('Missing token')
  return (
    <LiveQueryProvider client={client} token={token}>
      {children}
    </LiveQueryProvider>
  )
}
```

Only the `client` and `token` props are required. For debugging you can pass a `logger={console}` prop.

You can also use the `useIsEnabled` hook to debug wether you have a parent `<LiveQueryProvider />` in your React tree or not.

### 3. Making a Remix route conditionally preview drafts

Here's the Remix route we'll be adding live preview of drafts, it's pretty basic:

```tsx
// app/routes/index.tsx
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData } from '@remix-run/react'

import { client } from '~/lib/sanity'
import type { UsersResponse } from '~/UsersList'
import { UsersList, usersQuery } from '~/UsersList'
import { Layout } from '~/ui'

export async function loader({ request }: LoaderArgs) {
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

Update the `client.fetch` call to use the new `sanityFetch` utility we created earlier, as well as the `token`:

```tsx
import { token, sanityFetch } from '~/lib/sanity'

const previewDrafts = process.env.SANITY_API_PREVIEW_DRAFTS === 'true'
const users = await sanityFetch<UsersResponse>({
  previewDrafts,
  query: usersQuery,
  params: { lastId },
})
```

Update the `loader` return statement from `return {users, lastId}` to:

```tsx
return { previewDrafts, token, users, lastId }
```

And add `previewDrafts`, and `token`, to `useLoaderData`:

```tsx
const { previewDrafts, token, users, lastId } = useLoaderData<typeof loader>()
```

Then make the render conditional based on wether `previewDrafts` is set:

```tsx
const children = <UsersList data={users} lastId={lastId} />

return (
  <Layout>
    {previewDrafts ? (
      <Suspense fallback={children}>
        <PreviewProvider token={token}>{children}</PreviewProvider>
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

import { token, sanityFetch } from '~/lib/sanity'
import type { UsersResponse } from '~/UsersList'
import { UsersList, usersQuery } from '~/UsersList'
import { Layout } from '~/ui'

const PreviewProvider = lazy(() => import('~/PreviewProvider'))

export async function loader({ request }: LoaderArgs) {
  const previewDrafts =
    process.env.SANITY_API_PREVIEW_DRAFTS === 'true' ? { token } : undefined
  const url = new URL(request.url)
  const lastId = url.searchParams.get('lastId') || ''

  const users = await sanityFetch<UsersResponse>({
    previewDrafts,
    query: usersQuery,
    params: { lastId },
  })

  return { previewDrafts, token, users, lastId }
}

export default function Index() {
  const { previewDrafts, token, users, lastId } = useLoaderData<typeof loader>()

  const children = <UsersList data={users} lastId={lastId} />

  return (
    <Layout>
      {previewDrafts ? (
        <Suspense fallback={children}>
          <PreviewProvider token={token!}>{children}</PreviewProvider>
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
  },
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

#### Using the `LiveQuery` wrapper component instead of the `useLiveQuery` hook

The main benefit of the `LiveQuery` wrapper, over the `useLiveQuery` hook, is that it implements lazy loading. Unless `enabled` the code for `useLiveQuery` isn't loaded and your application's bundlesize isn't increased in production.

```tsx
import { LiveQuery } from '@sanity/preview-kit/live-query'

const UsersList = memo(function UsersList(props: UsersListProps) {
  const { data, lastId } = props

  return (
    <>
      <ListView list={data.list} />
      <ListPagination total={data.total} lastId={lastId} />
    </>
  )
})

export default function Layout(props: LayoutProps) {
  return (
    <LiveQuery
      enabled={props.preview}
      query={usersQuery}
      params={{ lastId: props.lastId }}
      initialData={props.data}
    >
      <UsersList
        // LiveQuery will override the `data` prop with the real-time data when live previews are enabled
        data={props.data}
        // But other props will be passed through
        lastId={props.lastId}
      />
    </LiveQuery>
  )
}
```

For React Server Components it's important to note that the `children` of `LiveQuery` must be a `use client` component. Otherwise it won't be able to re-render as the `data` prop changes. The `as` prop can be used to make sure the component is only used as a client component when live previews are enabled, below is an example of how this is done in the Next.js App Router, using 3 separate files:

`app/users/[lastId]/UsersList.tsx`:

```tsx
// This component in itself doesn't have any interactivity and can be rendered on the server, and avoid adding to the browser bundle.

export default function UsersList(props: UsersListProps) {
  const { data, lastId } = props

  return (
    <>
      <ListView list={data.list} />
      <ListPagination total={data.total} lastId={lastId} />
    </>
  )
}
```

`app/users/[lastId]/UsersListPreview.tsx`:

```tsx
'use client'

import dynamic from 'next/dynamic'

// Re-exported components using next/dynamic ensures they're not bundled
// and sent to the browser unless actually used, with draftMode().enabled.

export default dynamic(() => import('./UsersList'))
```

`app/users/[lastId]/page.tsx`

```tsx
import { createClient } from '@sanity/client'
import { LiveQuery } from '@sanity/preview-kit/live-query'
import { draftMode } from 'next/headers'
import UsersList from './UsersList'
import UsersListPreview from './UsersListPreview'

const client = createClient({
  // standard client config
})

export default async function UsersPage(params) {
  const { lastId } = params
  const data = await client.fetch(
    usersQuery,
    { lastId },
    { perspective: draftMode().isEnabled ? 'previewDrafts' : 'published' },
  )

  return (
    <LiveQuery
      enabled={draftMode().isEnabled}
      query={usersQuery}
      params={{ lastId }}
      initialData={data}
      as={UsersListPreview}
    >
      <UsersList
        data={data}
        // LiveQuery ensures that the `lastId` prop used here is applied to `UsersListPreview` as well
        lastId={lastId}
      />
    </LiveQuery>
  )
}
```

What's great about this setup is that `UsersList` is rendering only on the server by default, but when live previews are enabled the `UsersListPreview` repackages it to a client component so it's able to re-render in the browser in real-time as the data changes. It's the closest thing to having your cake and eating it too.

#### Trouble-shooting and debugging

As the nature of live queries is that they're real-time, it can be hard to debug issues. Is nothing happening because no edits happened? Or because something isn't setup correctly?
To aid in understanding what's going on, you can pass a `logger` prop to `LiveQueryProvider`:

```tsx
<LiveQueryProvider client={client} token={token} logger={console}>
  {children}
</LiveQueryProvider>
```

You'll now get detailed reports on how it's setup and what to expect in terms of how it responds to updates. For example in large datasets it may use a polling interval instead of running GROQ queries on a complete local cache of your dataset.

You can also use the `useIsEnabled` hook to determine of a live component (something that uses `useLiveQuery`) has a `LiveQueryProvider` in the parent tree or not:

```tsx
import { useLiveQuery, useIsEnabled } from '@sanity/preview-kit'

export function PreviewUsersList(props) {
  const [data] = useLiveQuery(props.data, query, params)
  const isLive = useIsEnabled()

  if (!isLive) {
    throw new TypeError('UsersList is not wrapped in a LiveQueryProvider')
  }

  return <UsersList data={data} />
}
```

If it's always `false` it's an indicator that you may need to lift your `LiveQueryProvider` higher up in the tree. Depending on the framework it's recommended that you put it in:

- Remix: `src/app/routes/index.tsx`
- Next App Router: `src/app/layout.tsx`
- Next Pages Router: `src/pages/_app.tsx`

#### Fine-tuning `cache`

The defaults set for the `cache` prop are optimized for most use cases, but are conservative since the size of your documents can vary a lot. And your queries might only use some document types and it's not necessary to cache every type.
Thus you can fine-tune the cache by passing a custom `cache` prop to `LiveQueryProvider`:

```tsx
import { LiveQueryProvider } from '@sanity/preview-kit'

return (
  <LiveQueryProvider
    client={client}
    token={token}
    cache={{
      // default: 3000, increased to 10000 for this example app as each document is small
      maxDocuments: 10000,
      // The default cache includes all document types, you can reduce the amount of documents
      // by only including the ones you need.
      // You can run the `array::unique(*._type)` GROQ query in `Vision` in your Studio to see how many types are in your dataset.
      // Just be careful that you don't forget the document types you might be using in strong references, such as `project` or `sanity.imageAsset`
      includeTypes: ['page', 'product', 'sanity.imageAsset'],
      // Turn off using a mutation EventSource listener, this means content updates will require a manual refresh
      listen: false,
    }}
    // If the cache is full it'll fallback to a polling interval mode, that refreshes every 10 seconds by default.
    // You can opt-in to having an error thrown instead by setting this to `0`.
    refreshInterval={10000}
    // Passing a logger gives you more information on what to expect based on your configuration
    logger={console}
  >
    {children}
  </LiveQueryProvider>
)
```

#### Content Source Map features

When the `client` instance is configured to `client.config().resultSourceMap == true` the `LiveQueryProvider` will opt-in to a faster and smarter cache than the default mode.
It'll only listen for mutations on the documents that you are using in your queries, and apply the mutations to the cache in real-time.
This mode is best-effort, and if you're relying on features such as `upper` you may want to disable this mode.

```tsx
import { LiveQueryProvider } from '@sanity/preview-kit'

return (
  <LiveQueryProvider
    client={client}
    token={token}
    turboSourceMap={false}
    // Passing a logger gives you more information on what to expect based on your configuration
    logger={console}
  >
    {children}
  </LiveQueryProvider>
)
```

For data that can't be traced with Content Source Maps there's a background refresh interval. Depending on your queries you might want to tweak this interval to get the best performance.

```tsx
import { LiveQueryProvider } from '@sanity/preview-kit'

return (
  <LiveQueryProvider
    client={client}
    token={token}
    // Refetch all queries every minute instead of the default 10 seconds
    refreshInterval={1000 * 60}
    // Passing a logger gives you more information on what to expect based on your configuration
    logger={console}
  >
    {children}
  </LiveQueryProvider>
)
```

# `@sanity/preview-kit/client`

## Visual Editing with Content Source Maps

> **Note**
>
> [Content Source Maps][content-source-maps-intro] are available [as an API][content-source-maps] for select [Sanity enterprise customers][enterprise-cta]. [Contact our sales team for more information.][sales-cta]

You can use [Visual Editing][visual-editing-intro] with any framework, not just React. [Read our guide for how to get started.][visual-editing]

### Enhanced Sanity client with `createClient`

Preview Kit's enhanced Sanity client is built on top of `@sanity/client` and is designed to be a drop-in replacement. It extends the client configuration with options for returning encoded metadata from Content Source Maps.

```ts
// Remove your vanilla `@sanity/client` import
// import {createClient, type ClientConfig} from '@sanity/client'

// Use the enhanced client instead
import { createClient, type ClientConfig } from '@sanity/preview-kit/client'

const config: ClientConfig = {
  // ...base config options

  // Required: when "encodeSourceMap" is enabled
  // Set it to relative or absolute URL of your Sanity Studio
  studioUrl: '/studio', // or 'https://your-project-name.sanity.studio'

  // Required: for encoded metadata from Content Source Maps
  // 'auto' is the default, you can also use `true` or `false`
  encodeSourceMap: 'auto',
}

const client = createClient(config)
```

#### `studioUrl`

**Required** when `encodeSourceMap` is active, and can either be an absolute URL:

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

Accepts `"auto"`, the default, or a `boolean`. Controls when to encode the content source map into strings using `@vercel/stega` encoding. When `"auto"` is used a best-effort environment detection is used to see if the environment is a Vercel Preview deployment. On a different hosting provider, or in local development, configure this option to make sure it is only enabled in non-production deployments.

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
import { createClient } from '@sanity/preview-kit/client'
import { mapToEditLinks } from '@sanity/preview-kit/csm'

const client = createClient({
  ...config,
  resultSourceMap: true, // Tells Content Lake to include content source maps in the response
  encodeSourceMap: false, // Disable the default encoding behavior
})

// const result = await client.fetch(query, params)
const { result, resultSourceMap } = await client.fetch(
  query,
  params,
  { filterResponse: false }, // This option is returns the entire API response instead of selecting just `result`
)
const studioUrl = 'https://your-company.com/studio'
const editLinks = mapToEditLinks(result, resultSourceMap, studioUrl)

const title = result.title
const titleEditLink = editLinks.title

console.log(title, titleEditLink)
```

## Using Perspectives

The `perspective` option can be used to specify special filtering behavior for queries. The default value is `raw`, which means no special filtering is applied, while [`published`](#published) and [`previewDrafts`](#previewdrafts) can be used to optimize for specific use cases. Read more about this option:

- [Perspectives in Sanity docs][perspectives-docs]
- [Perspectives in @sanity/client README][perspectives-readme]

# `@sanity/preview-kit/csm`

[Content Source Maps][content-source-maps-intro] (CSM) package provides utilities for processing CSM and encoding metadata into results.

## Transcoding

Transcoding is the process of taking an input and encoding CSM strings using `@vercel/stega` encoding.

```ts
import {
  createTranscoder,
  type CreateTranscoderConfig,
} from '@sanity/preview-kit/csm'

const config: CreateTranscoderConfig = {
  // Required. Set it to relative or absolute URL of your Sanity Studio
  studioUrl: '/studio', // or 'https://your-project-name.sanity.studio'

  // Optional. Customize which paths are encoded
  encodeSourceMapAtPath: (props) => {
    if (props.path[0] === 'externalUrl') {
      return false
    }
    // The default behavior is packaged into `filterDefault`, allowing you enable encoding fields that are skipped by default
    return props.filterDefault(props)
  },

  // Optional. Detailed debug info and reports on which fields are encoded and which are skipped:
  logger: console,
}

// Fetch data with CSM
const { result, csm } = await fetchDataWithCSM()

// Create a transcoder
const transcoder = createTranscoder(config)

// Transcode the CSM into the result with `@vercel/stega` encoding.
const transcoderResult = transcoder(result, csm)

// transcoderResult.result contains the transcoded result
return transcoderResult.result
```

# Release new version

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
[perspectives-docs]: https://www.sanity.io/docs/perspectives
[perspectives-readme]: https://github.com/sanity-io/client/#performing-queries

# @sanity/preview-kit<!-- omit in toc -->

[Sanity.io](https://www.sanity.io/?utm_source=github&utm_medium=readme&utm_campaign=preview-kit) toolkit for building live-as-you-type content preview experiences and visual editing.

- [Installation](#installation)
- [`@sanity/preview-kit/client` Visual Editing with Content Source Maps](#sanitypreview-kitclient)
- [`@sanity/preview-kit` Live real-time preview for React](#sanitypreview-kit)
  - [Demos \& Starters](#demos--starters)
  - [Remix, cookie auth only](#remix-cookie-auth-only)
  - [Next `/pages` Preview Mode, cookie auth only](#next-pages-preview-mode-cookie-auth-only)
  - [Next `/pages` Preview Mode, with a viewer token](#next-pages-preview-mode-with-a-viewer-token)
  - [Next `/pages` Preview Mode, with fast SSR hydration](#next-pages-preview-mode-with-fast-ssr-hydration)
- [Development](#development)
  - [Release new version](#release-new-version)
- [License](#license)

# Installation

```bash
npm i @sanity/preview-kit
```

```bash
pnpm i @sanity/preview-kit
```

```bash
yarn add @sanity/preview-kit
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
import { createClient } from '@sanity/preview-kit/client'

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

## Live real-time preview for React

Write GROQ queries like [@sanity/client](https://github.com/sanity-io/client) and have them resolve in-memory, locally. Updates from Content Lake are streamed in real-time with sub-second latency.

Requires React 18, support for other libraries like Solid, Svelte, Vue etc are planned. For now you can use [@sanity/groq-store](https://github.com/sanity-io/groq-store) [directly](https://github.com/sanity-io/groq-store/blob/main/example/example.ts).

You create a `usePreview` hook using `definePreview`

```tsx
import { definePreview } from '@sanity/preview-kit'

const usePreview = definePreview({ projectId, dataset })
```

If you want to declare the config in a separate file, and have full typings, you can import `PreviewConfig`:

```tsx
import type { PreviewConfig } from '@sanity/preview-kit'
export const previewConfig: PreviewConfig = {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  // The limit on number of documents. The default is 3000, increase or decrease
  // as needed and use `includeTypes` to further optimize the performance.
  documentLimit: 10000,
  // Optional allow-list filter for document types. You can use this to limit
  // the amount of documents by declaring the types you want to sync. Note that
  // since you're fetching a subset of your dataset, queries that works against
  // your Content Lake might not work against the local groq-store.
  includeTypes: ['post', 'page', 'product', 'sanity.imageAsset'],
  // By default documents that are "draft" are overlayed with their published
  // counterparts. This lets you simulate what your app will look like after
  // the drafts are published.  If your queries are already equipped to handle
  // drafts vs published or you otherwise show UI depending on draft status set
  // this to false.
  overlayDrafts: true,
  // By default new changes made to the dataset will be automatically synced,
  // providing a live preview experience. This behavior can be disabled by
  // setting the `listen` flag to `false`. When disabled, you will still be able
  // to preview content, but will need to reload the page to see any change made
  // after the page loaded.
  listen: true,
}
```

The component that calls `usePreview` needs to be wrapped in a `Suspense` boundary as it will ["suspend"](https://reactjs.org/docs/react-api.html#reactsuspense) until the `@sanity/groq-store` is done loading your dataset and ready to resolve your queries.

## Demos & Starters

- [Sanity Studio v3 + Remix](https://github.com/SimeonGriggs/remix-sanity-studio-v3)
- [A Next.js Blog with a Native Authoring Experience](https://github.com/sanity-io/nextjs-blog-cms-sanity-v3)

## Remix, cookie auth only

```tsx
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import createClient from '@sanity/client'
import type { UsePreview } from '@sanity/preview-kit'
import { definePreview, PreviewSuspense } from '@sanity/preview-kit'
import groq from 'groq'
import { useReducer } from 'react'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = groq`count(*[])`

export const loader = async () => {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    useCdn: true,
  })

  return json({ data: await client.fetch<number>(query) })
}

export default function CountPage() {
  const { data } = useLoaderData<typeof loader>()
  const [preview, toggle] = useReducer((state) => !state, false)

  return (
    <>
      <button type="button" onClick={toggle}>
        {preview ? 'Stop preview' : 'Start preview'}
      </button>
      {preview ? (
        <PreviewSuspense fallback={<Count data={data} />}>
          <PreviewCount />
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

const usePreview: UsePreview<number> = definePreview({
  projectId,
  dataset,
  onPublicAccessOnly: () =>
    alert('You are not logged in. You will only see public data.'),
})
const PreviewCount = () => {
  const data = usePreview(null, query)
  return <Count data={data!} />
}
```

## Next `/pages` Preview Mode, cookie auth only

For NextJS with `appDir`, see the [next-sanity](https://github.com/sanity-io/next-sanity) docs.

```tsx
// pages/index.js
import { PreviewSuspense } from '@sanity/preview-kit'
import createClient from '@sanity/client'
import DataTable from 'components/DataTable'
import { lazy } from 'react'

const PreviewDataTable = lazy(() => import('components/PreviewDataTable'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

export const getStaticProps = async ({ preview = false }) => {
  if (preview) {
    return { props: { preview } }
  }

  const data = await client.fetch(`*[]`)

  return { props: { preview, data } }
}

export default function IndexPage({ preview, data }) {
  if (preview) {
    return (
      <PreviewSuspense fallback="Loading...">
        <PreviewDataTable />
      </PreviewSuspense>
    )
  }

  return <DataTable data={data} />
}
```

```tsx
// components/PreviewDataTable.js
import { definePreview } from '@sanity/preview-kit'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

const usePreview = definePreview({ projectId, dataset })

export default function PreviewDataTable() {
  const data = usePreview(null, `*[]`)

  return <DataTable data={data} />
}
```

## Next `/pages` Preview Mode, with a viewer token

This example have the added benefit that it works in non-chromium browsers like Safari. And without needing a Sanity authenticated session to exist on the origin.
This also means you need to protect your `pages/api/preview` handler with a secret, since the `token` can be used to query _any_ data in your dataset. Only share preview links with people that you're ok with being able to see everything in your dataset.

```tsx
// pages/index.js
import { PreviewSuspense } from '@sanity/preview-kit'
import createClient from '@sanity/client'
import DataTable from 'components/DataTable'
import { lazy } from 'react'

const PreviewDataTable = lazy(() => import('components/PreviewDataTable'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

export const getStaticProps = async ({ preview = false, previewData = {} }) => {
  if (preview) {
    return { props: { preview, token: previewData.token } }
  }

  const data = await client.fetch(`*[]`)

  return { props: { preview, data } }
}

export default function IndexPage({ preview, data, token }) {
  if (preview) {
    return (
      <PreviewSuspense fallback="Loading...">
        <PreviewDataTable token={token} />
      </PreviewSuspense>
    )
  }

  return <DataTable data={data} />
}
```

```tsx
// components/PreviewDataTable.js
import { definePreview } from '@sanity/preview-kit'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

const usePreview = definePreview({ projectId, dataset })

export default function PreviewDataTable({ token }) {
  const data = usePreview(token, `*[]`)

  return <DataTable data={data} />
}
```

```js
// pages/api/preview.js
export default function preview(req, res) {
  const secret = process.env.PREVIEW_SECRET
  // Check the secret if it's provided, enables running preview mode locally
  // before the env var is setup
  if (secret && req.query.secret !== secret) {
    return res.status(401).json({ message: 'Invalid secret' })
  }
  // This token should only have `viewer` access rights in
  // https://manage.sanity.io
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }

  res.setPreviewData({ token })
  res.writeHead(307, { Location: '/' })
  res.end()
}
```

## Next `/pages` Preview Mode, with fast SSR hydration

This example extends the `preview token` version to use fast SSR hydration.
The way it works is by providing the data use for Server Side Rendering (SSR) as the 4th argument to `usePreview`. This will cause `usePreview` to no longer suspend while it does the initial dataset export, instead it'll return your provided snapshot until it's ready to run GROQ in-memory.

```tsx
// pages/index.js
import { PreviewSuspense } from '@sanity/preview-kit'
import createClient from '@sanity/client'
import DataTable from 'components/DataTable'
import { lazy } from 'react'

const PreviewDataTable = lazy(() => import('components/PreviewDataTable'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

export const getStaticProps = async ({ preview = false, previewData = {} }) => {
  if (preview) {
    const previewClient = client.withConfig({ token: previewData.token })
    // Query altered to include drafts, and all documents that don't have a
    // draft
    const data = await client.fetch(`*[!(_id in path("drafts.**"))]`)
    return { props: { preview, token: previewData.token } }
  }

  const data = await client.fetch(`*[]`)

  return { props: { preview, data } }
}

export default function IndexPage({ preview, data, token }) {
  if (preview) {
    // We render DataTable with the preview data, and PreviewDataTable will
    // stream updates that might happen after the initial SSR hydration and the
    // client takes over rendering
    return (
      <PreviewSuspense fallback={<DataTable data={data} />}>
        <PreviewDataTable token={token} />
      </PreviewSuspense>
    )
  }

  return <DataTable data={data} />
}
```

```tsx
// components/PreviewDataTable.js
import { definePreview } from '@sanity/preview-kit'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

// We turn off `overlayDrafts` since the GROQ queries that run in preview mode
// is updated to overlay drafts instead, this lets us reuse the same query
// during preview mode, with @sanity/client when rendering preview data on the
// server, with `@sanity/groq-store` taking over in the browser
const usePreview = definePreview({ projectId, dataset, overlayDrafts: false })

export default function PreviewDataTable({ token }) {
  // Query altered to include drafts, and all documents that don't have a draft
  const data = usePreview(token, `*[!(_id in path("drafts.**"))]`)

  return <DataTable data={data} />
}
```

## Create React App, cookie auth only

If you're hosting Sanity Studio on the same domain as you're doing previews, you may use `cookie` based auth:

```jsx
import createClient from '@sanity/client'
import { definePreview } from '@sanity/preview-kit'
import groq from 'groq'
import { Suspense, useReducer } from 'react'
import { createRoot } from 'react-dom/client'
import useSWR from 'swr/immutable'

const root = createRoot(document.getElementById('root'))
root.render(
  <Suspense fallback="Loading...">
    <App />
  </Suspense>
)

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID
const dataset = process.env.REACT_APP_SANITY_DATASET
const apiVersion = process.env.REACT_APP_SANITY_API_VERSION
const client = createClient({ projectId, dataset, apiVersion, useCdn: true })

const query = groq`count(*[])`

function App() {
  const [preview, toggle] = useReducer((state) => !state, false)
  const { data } = useSWR(query, (query) => client.fetch(query), {
    suspense: true,
  })

  return (
    <>
      <button type="button" onClick={toggle}>
        {preview ? 'Stop preview' : 'Start preview'}
      </button>
      {preview ? <PreviewCount /> : <Count data={data} />}
    </>
  )
}

const Count = ({ data }) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview = definePreview({
  projectId,
  dataset,
  onPublicAccessOnly: () =>
    alert('You are not logged in. You will only see public data.'),
})
const PreviewCount = () => {
  const data = usePreview(null, query)

  return <Count data={data} />
}
```

## Create React App, custom token auth

If you're not hosting Sanity Studio on the same domain as your previews, or if you need to support browsers that don't work with cookie auth (iOS Safari or browser incognito modes), you may use the `token` option to provide a Sanity Viewer token:

```jsx
import createClient from '@sanity/client'
import { definePreview } from '@sanity/preview-kit'
import groq from 'groq'
import { Suspense, useReducer } from 'react'
import { createRoot } from 'react-dom/client'
import useSWR from 'swr/immutable'

const root = createRoot(document.getElementById('root'))
root.render(
  <Suspense fallback="Loading...">
    <App />
  </Suspense>
)

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID
const dataset = process.env.REACT_APP_SANITY_DATASET
const apiVersion = process.env.REACT_APP_SANITY_API_VERSION
const client = createClient({ projectId, dataset, apiVersion, useCdn: true })

const query = groq`count(*[])`

function App() {
  const [preview, toggle] = useReducer((state) => !state, false)
  const { data } = useSWR(query, (query) => client.fetch(query), {
    suspense: true,
  })

  return (
    <>
      <button type="button" onClick={toggle}>
        {preview ? 'Stop preview' : 'Start preview'}
      </button>
      {preview ? <PreviewCount /> : <Count data={data} />}
    </>
  )
}

const Count = ({ data }) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview = definePreview({ projectId, dataset })
const PreviewCount = () => {
  // Call custom authenticated backend to fetch the Sanity Viewer token
  const { data: token } = useSWR(
    'https://example.com/preview/token',
    (url) => fetch(url, { credentials: 'include' }).then((res) => res.text()),
    { suspense: true }
  )
  const data = usePreview(token, query)

  return <Count data={data} />
}
```

# Development

If you have access to the [test studio](https://preview-kit-test-studio.sanity.build) and our Vercel Team, then:

1. `npx vercel link && npx vercel env pull`
2. `pnpm run dev` which gives you the test Next app running on `http://localhost:3000`.
3. Edit data in the test studio and watch it update live.

If you don't have access then you need to:

1. Create a new Sanity project and dataset, and enter their variables in `.env.local` (use `.env.local.example` to get started).
2. Open the Studio [codesandbox](https://codesandbox.io/s/github/sanity-io/preview-kit/tree/main/studio) and edit `src/App.tsx` to update `projectId` and `dataset`.
3. You can now run `pnpm run dev` and test things on `http://localhost:3000`.
4. As you edit things in the codesandbox studio you'll see them streamed to the next app.

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

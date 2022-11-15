# @sanity/preview-kit

[Sanity.io](https://www.sanity.io/?utm_source=github&utm_medium=readme&utm_campaign=preview-kit) toolkit for building live-as-you-type content preview experiences.
Write GROQ queries like [@sanity/client](https://github.com/sanity-io/client) and have them resolve in-memory, locally. Updates from Content Lake are streamed in real-time with sub-second latency.

Requires React 18, support for other libraries like Preact, Solid, Svelte, Vue etc is planned. For vanilla JS subscriptions you can use [@sanity/groq-store](https://github.com/sanity-io/groq-store) [directly](https://github.com/sanity-io/groq-store/blob/main/example/example.ts).

## Installation

```bash
npm i @sanity/preview-kit
```

```bash
yarn add @sanity/preview-kit
```

## Usage

You create a `usePreview` hook using `definePreview`

```tsx
import { definePreview } from '@sanity/preview-kit'

const usePreview = definePreview({ projectId, dataset })
```

If you want to declare the config in a separate file, and have full typings, you can import `PreviewConfig`:

```tsx
import type { PreviewConfig } from '@sanity/preview-kit'
export const previewConfig: PreviewConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  // The limit on number of documents, to prevent using too much memory unexpectedly
  // It's 3000 by default, increase or decrease as needed and use `includeTypes` to further optimize the performance
  documentLimit: 10000,
  // Optional allow list filter for document types. You can use this to limit the amount of documents by declaring the types you want to sync. Note that since you're fetching a subset of your dataset, queries that works against your Content Lake might not work against the local groq-store.
  includeTypes: ['post', 'page', 'product', 'sanity.imageAsset'],
}
```

The component that calls `usePreview` needs to be wrapped in a `Suspense` boundary as it will ["suspend"](https://reactjs.org/docs/react-api.html#reactsuspense) until the `@sanity/groq-store` is done loading your dataset and ready to resolve your queries. This component should also only be rendered in the browser and not on the server. If you use `PreviewSuspense` then both gotchas are covered for you:

```tsx
import { definePreview, PreviewSuspense } from '@sanity/preview-kit'

const usePreview = definePreview({ projectId, dataset })

function PreviewComponent() {
  const data = usePreview(null, `*[]`)
}

export default function Page() {
  if (preview) {
    return (
      <PreviewSuspense fallback="Loading...">
        <PreviewComponent />
      </PreviewSuspense>
    )
  }
}
```

### Next 12 Preview Mode, cookie auth only

```tsx
// pages/index.js
import { PreviewSuspense } from '@sanity/preview-kit'
import sanityClient from '@sanity/client'
import DataTable from 'components/DataTable'
import { lazy } from 'react'

const PreviewDataTable = lazy(() => import('components/PreviewDataTable'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export const getStaticProps = async ({ preview = false }) => {
  if (preview) {
    return { props: { preview } }
  }

  const client = sanityClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion: '2022-11-10',
  })
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

### Next 12 Preview Mode, with a viewer token

This example have the added benefit that it works in non-chromium browsers like Safari. And without needing a Sanity authenticated session to exist on the origin.
This also means you need to protect your `pages/api/preview` handler with a secret, since the `token` can be used to query _any_ data in your dataset. Only share preview links with people that you're ok with being able to see everything in your dataset.

```tsx
// pages/index.js
import { PreviewSuspense } from '@sanity/preview-kit'
import sanityClient from '@sanity/client'
import DataTable from 'components/DataTable'
import { lazy } from 'react'

const PreviewDataTable = lazy(() => import('components/PreviewDataTable'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export const getStaticProps = async ({ preview = false, previewData = {} }) => {
  if (preview) {
    return { props: { preview, token: previewData.token } }
  }

  const client = sanityClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion: '2022-11-10',
  })
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
  // Check the secret if it's provided, enables running preview mode locally before the env var is setup
  if (secret && req.query.secret !== secret) {
    return res.status(401).json({ message: 'Invalid secret' })
  }
  // This token should only have `viewer` access rights in https://manage.sanity.io
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }

  res.setPreviewData({ token })
  res.writeHead(307, { Location: '/' })
  res.end()
}
```

# Development

If you have access to the [test studio](https://preview-kit-test-studio.sanity.build) and our Vercel Team, then:

1. `npx vercel link && npx vercel env pull`
2. `npm run dev` which gives you the test Next app running on `http://localhost:3000`.
3. Edit data in the test studio and watch it update live.

If you don't have access then you need to:

1. Create a new Sanity project and dataset, and enter their variables in `.env.local` (use `.env.local.example` to get started).
2. Open the Studio [codesandbox](https://codesandbox.io/s/github/sanity-io/preview-kit/tree/main/studio) and edit `src/App.tsx` to update `projectId` and `dataset`.
3. You can now run `npm run dev` and test things on `http://localhost:3000`.
4. As you edit things in the codesandbox studio you'll see them streamed to the next app.

## Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/preview-kit/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

## License

MIT-licensed. See [LICENSE](LICENSE).

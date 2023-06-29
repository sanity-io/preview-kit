import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData, useRevalidator } from '@remix-run/react'

import {
  Table,
  Timestamp,
  tableQuery,
  Button,
  ViewPublishedButton,
  PreviewDraftsButton,
  footerQuery,
  Footer,
} from 'ui/react'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { getSession } from '~/sessions'
import { useEffect } from 'react'
import { createClient, type SanityClient } from '@sanity/preview-kit/client'

const projectId = process.env.SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2022-11-15'
const useCdn = true
const studioUrl = 'https://preview-kit-test-studio.sanity.build/'

function getClient(preview?: { token: string }): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    studioUrl,
    logger: console,
    encodeSourceMap: true,
    perspective: 'published',
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      perspective: 'previewDrafts',
      token: preview.token,
      useCdn: false,
    })
  }
  return client
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const preview = session.get('view') === 'previewDrafts'

  const token = process.env.SANITY_API_READ_TOKEN!
  const client = getClient(preview ? { token } : undefined)
  const [table, footer] = await Promise.all([
    client.fetch(tableQuery),
    client.fetch(footerQuery),
  ])
  const timestamp = new Date().toJSON()

  return {
    preview,
    table,
    footer,
    timestamp,
    server__adapter: adapter,
    server__environment: environment,
  }
}

export default function Index() {
  const {
    preview,
    table,
    footer,
    timestamp,
    server__adapter,
    server__environment,
  } = useLoaderData<typeof loader>()

  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
    })
  }, [])

  const button = preview ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const action = preview ? '/api/exit-preview' : '/api/preview'

  return (
    <>
      <form action={action} style={{ display: 'contents' }}>
        {button}
        <Table data={table} />
        <Footer data={footer} />
        <Timestamp date={timestamp} />
      </form>
      <RefreshButton />
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ server__adapter, server__environment }),
        }}
      />
    </>
  )
}

function RefreshButton() {
  const revalidator = useRevalidator()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        revalidator.revalidate()
      }}
      className="section"
    >
      <Button>Refresh</Button>
    </form>
  )
}

import { useLoaderData, useRevalidator } from '@remix-run/react'
import type { LoaderArgs } from '@vercel/remix'

import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { useListeningQueryStatus } from '@sanity/preview-kit'
import { useEffect } from 'react'
import {
  Button,
  PreviewDraftsButton,
  Timestamp,
  ViewPublishedButton,
  footerQuery,
  tableQuery,
} from 'ui/react'
import Footer from '~/Footer'
import PreviewProvider from '~/PreviewProvider'
import Table from '~/Table'
import { getSession } from '~/sessions'
import { getClient } from '../getClient'

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
    token,
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
    token,
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

  const button = preview ? (
    <ViewPublishedButtonWithLoadingStatus />
  ) : (
    <PreviewDraftsButton />
  )
  const action = preview ? '/api/exit-preview' : '/api/preview'

  return (
    <>
      <form action={action} style={{ display: 'contents' }}>
        {preview ? (
          <PreviewProvider token={token!}>
            {button}
            <Table data={table} />
            <Footer data={footer} />
          </PreviewProvider>
        ) : (
          <>
            {button}
            <Table data={table} />
            <Footer data={footer} />
          </>
        )}
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

function ViewPublishedButtonWithLoadingStatus() {
  const status = useListeningQueryStatus(tableQuery)

  return <ViewPublishedButton isLoading={status === 'loading'} />
}

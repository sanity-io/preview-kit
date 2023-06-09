import { createClient } from '@sanity/preview-kit/client'
import type { LoaderArgs } from '@vercel/remix'
import { useLoaderData, useRevalidator } from '@remix-run/react'

import type { TableProps, FooterProps } from 'ui/react'
import {
  Timestamp,
  tableQuery,
  Button,
  ViewPublishedButton,
  PreviewDraftsButton,
  footerQuery,
} from 'ui/react'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { getSession } from '~/sessions'
import { useEffect } from 'react'
import Footer from '~/Footer'
import Table from '~/Table'
import PreviewProvider from '~/PreviewProvider'
import { useListeningQueryStatus } from '@sanity/preview-kit'

const projectId = process.env.SANITY_PROJECT_ID || 'pv8y60vp'
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2022-11-15'
const useCdn = true

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const preview = session.get('view') === 'previewDrafts'

  const sanityClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    studioUrl: 'https://preview-kit-test-studio.sanity.build/',
    encodeSourceMap: true,
    encodeSourceMapAtPath: () => true,
  })

  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }
  // Used to preview drafts as they will appear once published
  const draftsClient = sanityClient.withConfig({
    perspective: 'previewDrafts',
    // required by previewDrafts
    apiVersion: 'X',
    useCdn: false,
    token,
  })
  const client = preview ? draftsClient : sanityClient
  const table = client.fetch<TableProps['data']>(tableQuery)
  const footer = client.fetch<FooterProps['data']>(footerQuery)
  const timestamp = new Date().toJSON()

  return {
    preview,
    token,
    projectId,
    dataset,
    table: await table,
    footer: await footer,
    timestamp,
    server__adapter: adapter,
    server__environment: environment,
  }
}

export default function Index() {
  const {
    preview,
    token,
    projectId,
    dataset,
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
          <PreviewProvider
            token={token!}
            projectId={projectId}
            dataset={dataset}
          >
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

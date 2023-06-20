import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useEffect } from 'react'
import {
  Button,
  Container,
  FooterProps,
  PreviewDraftsButton,
  TableProps,
  Timestamp,
  ViewPublishedButton,
  footerQuery,
  tableQuery,
} from 'ui/react'
import { getClient } from '../sanity.client'

import { useListeningQueryStatus } from '@sanity/preview-kit'
import { lazy } from 'react'
import Footer from '../Footer'
import Table from '../Table'

const PreviewProvider = lazy(() => import('../PreviewProvider'))

export const getStaticProps: GetStaticProps<{
  draftMode: boolean
  token: string
  table: TableProps['data']
  footer: FooterProps['data']
  timestamp: string
  server__adapter: typeof adapter
  server__environment: typeof environment
}> = async ({ draftMode = false }) => {
  const token = process.env.SANITY_API_READ_TOKEN!
  const client = getClient(draftMode ? { token } : undefined)
  const [table, footer] = await Promise.all([
    client.fetch(tableQuery),
    client.fetch(footerQuery),
  ])
  const timestamp = new Date().toJSON()

  return {
    props: {
      draftMode,
      token,
      table: await table,
      footer: await footer,
      timestamp,
      server__adapter: adapter,
      server__environment: environment,
    },
  }
}

export default function Page({
  draftMode,
  token,
  table,
  footer,
  timestamp,
  server__adapter,
  server__environment,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
    })
  }, [])

  return (
    <Container>
      <form style={{ display: 'contents' }}>
        {draftMode ? (
          <ViewPublishedButton formAction="/api/disable-draft" />
        ) : (
          <PreviewDraftsButton formAction="/api/draft" />
        )}
      </form>
      {draftMode ? (
        <PreviewProvider token={token!}>
          <Table data={table} />
          <Footer data={footer} />
        </PreviewProvider>
      ) : (
        <>
          <Table data={table} />
          <Footer data={footer} />
        </>
      )}
      <Timestamp date={timestamp} />
      <RefreshButton />
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ server__adapter, server__environment }),
        }}
      />
    </Container>
  )
}

function RefreshButton() {
  const status = useListeningQueryStatus(tableQuery)
  return (
    <form action="/api/revalidate" className="section">
      <Button isLoading={status === 'loading'}>Refresh</Button>
    </form>
  )
}

import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useEffect } from 'react'
import {
  Button,
  Container,
  Footer,
  FooterProps,
  PreviewDraftsButton,
  Table,
  TableProps,
  Timestamp,
  ViewPublishedButton,
  footerQuery,
  tableQuery,
} from 'ui/react'
import { getClient } from '../sanity.client'

export const getStaticProps: GetStaticProps<{
  draftMode: boolean
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
      table,
      footer,
      timestamp,
      server__adapter: adapter,
      server__environment: environment,
    },
  }
}

export default function Page({
  draftMode,
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
      <Table data={table} />
      <Footer data={footer} />
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
  return (
    <form action="/api/revalidate" className="section">
      <Button>Refresh</Button>
    </form>
  )
}

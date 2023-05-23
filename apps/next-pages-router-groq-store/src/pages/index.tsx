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
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { sanityClient } from '../sanity.client'
import { useEffect } from 'react'

import { lazy } from 'react'
import Table from '../Table'
import Footer from '../Footer'

const PreviewProvider = lazy(() => import('../PreviewProvider'))

export const getStaticProps: GetStaticProps<{
  preview: boolean
  token: string
  table: TableProps['data']
  footer: FooterProps['data']
  timestamp: string
  server__adapter: typeof adapter
  server__environment: typeof environment
}> = async ({ preview = false }) => {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }

  const client = preview
    ? // Used to preview drafts as they will appear once published
      sanityClient.withConfig({
        perspective: 'previewDrafts',
        // required by previewDrafts
        apiVersion: 'X',
        useCdn: false,
        token,
      })
    : sanityClient
  const table = client.fetch(tableQuery)
  const footer = client.fetch(footerQuery)
  const timestamp = new Date().toJSON()

  return {
    props: {
      preview,
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
  preview,
  token,
  table,
  footer,
  timestamp,
  server__adapter,
  server__environment,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const button = preview ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const action = preview ? '/api/exit-preview' : '/api/preview'

  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
    })
  }, [])

  return (
    <Container>
      <form action={action} style={{ display: 'contents' }}>
        {button}
        {preview ? (
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
      </form>
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

import {
  Button,
  Container,
  PreviewDraftsButton,
  Table,
  TableProps,
  Timestamp,
  ViewPublishedButton,
  tableQuery,
} from 'ui/react'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { sanityClient } from '../sanity.client'
import { useEffect } from 'react'

export const getStaticProps: GetStaticProps<{
  preview: boolean
  data: TableProps['data']
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
  const data = await client.fetch(tableQuery)
  const timestamp = new Date().toJSON()

  return {
    props: {
      preview,
      data,
      timestamp,
      server__adapter: adapter,
      server__environment: environment,
    },
  }
}

export default function Page({
  preview,
  data,
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
        <Table data={data} />
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

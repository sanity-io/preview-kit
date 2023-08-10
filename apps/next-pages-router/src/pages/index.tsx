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
import DefaultVariant from '../variants/default'
import GroqStoreVariant from '../variants/groq-store'
import LiveStoreVariant from '../variants/live-store'

export const getStaticProps: GetStaticProps<{
  draftMode: boolean
  token: string
  table: TableProps['data']
  footer: FooterProps['data']
  timestamp: string
  server__adapter: typeof adapter
  server__environment: typeof environment
  variant: string
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
      variant: process.env.VARIANT || 'default',
    },
  }
}

function Variant(props: InferGetStaticPropsType<typeof getStaticProps>) {
  switch (props.variant) {
    case 'default':
      return <DefaultVariant {...props} />
    case 'groq-store':
      return <GroqStoreVariant {...props} />
    case 'live-store':
      return <LiveStoreVariant {...props} />
    default:
      throw new Error(`Unknown variant: ${props.variant}`)
  }
}

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { draftMode, timestamp, server__adapter, server__environment } = props
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
      <Variant {...props} />
      {timestamp && <Timestamp date={timestamp} />}
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

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
import dynamic from 'next/dynamic'
import { useIsEnabled } from '@sanity/preview-kit'
import { sanityFetch, token } from '../sanity.fetch'

const DefaultVariant = dynamic(() => import('../variants/default'))
const GroqStoreVariant = dynamic(() => import('../variants/groq-store'))
const LiveStoreVariant = dynamic(() => import('../variants/live-store'))

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
  const [table, footer] = await Promise.all([
    sanityFetch<TableProps['data']>({draftMode,query: tableQuery}),
    sanityFetch<FooterProps['data']>({draftMode, query: footerQuery}),
  ])
  const timestamp = new Date().toJSON()

  return {
    props: {
      draftMode,
      token,
      table,
      footer,
      timestamp,
      server__adapter: adapter,
      server__environment: environment,
      variant: process.env.VARIANT || 'default',
    },
  }
}

function Variant(
  props: InferGetStaticPropsType<typeof getStaticProps> &
    React.PropsWithChildren,
) {
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
      <Variant {...props}>
        {timestamp && <Timestamp date={timestamp} />}
        <RefreshButton />
      </Variant>
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
  const isLive = useIsEnabled()
  return (
    <form
      action="/api/revalidate"
      className="section"
      title={
        isLive
          ? 'Live queries are enabled and refreshes queries automatically, refreshing manually is unnecessary'
          : undefined
      }
    >
      <Button disabled={isLive}>Refresh</Button>
    </form>
  )
}

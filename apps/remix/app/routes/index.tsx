import type { LoaderArgs, SerializeFrom } from '@vercel/remix'
import { useLoaderData, useRevalidator } from '@remix-run/react'

import type {
  TableProps,
  FooterProps} from 'ui/react';
import {
  Timestamp,
  tableQuery,
  Button,
  ViewPublishedButton,
  PreviewDraftsButton,
  footerQuery
} from 'ui/react'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { getSession } from '~/sessions'
import { lazy, useEffect } from 'react'
import { useIsEnabled } from '@sanity/preview-kit'
import { sanityFetch, token} from '~/sanity'


const DefaultVariant = lazy(() => import('~/variants/default'))
const GroqStoreVariant = lazy(() => import('~/variants/groq-store'))
const LiveStoreVariant = lazy(() => import('~/variants/live-store'))

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const previewDrafts = session.get('view') === 'previewDrafts'

  const [table, footer] = await Promise.all([
    sanityFetch<TableProps['data']>({previewDrafts, query: tableQuery}),
    sanityFetch<FooterProps['data']>({previewDrafts, query: footerQuery}),
  ])
  const timestamp = new Date().toJSON()

  return {
    variant: process.env.VARIANT || 'default',
    previewDrafts,
    token,
    table,
    footer,
    timestamp,
    server__adapter: adapter,
    server__environment: environment,
  }
}

function Variant(props: SerializeFrom<typeof loader>) {
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

export default function Index() {
  const props = useLoaderData<typeof loader>()
  const { previewDrafts, timestamp, server__adapter, server__environment } = props

  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
    })
  }, [])

  const button = previewDrafts ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const action = previewDrafts ? '/api/disable-draft' : '/api/draft'

  return (
    <>
      <form action={action} style={{ display: 'contents' }}>
        {button}
      </form>
      <Variant {...props}>
        <Timestamp date={timestamp} />
        <RefreshButton />
      </Variant>
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
  const isLive = useIsEnabled()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        revalidator.revalidate()
      }}
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

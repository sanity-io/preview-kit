import type { LoaderArgs, SerializeFrom } from '@vercel/remix'
import { useLoaderData, useRevalidator } from '@remix-run/react'

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
import { getClient } from '~/getClient'
import DefaultVariant from '~/variants/default'
import GroqStoreVariant from '~/variants/groq-store'
import LiveStoreVariant from '~/variants/live-store'


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
    variant: process.env.VARIANT || 'default',
    preview,
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
  const {
    preview,
    timestamp,
    server__adapter,
    server__environment,
  } = props

  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
    })
  }, [])

  const button = preview ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const action = preview ? '/api/disable-draft' : '/api/draft'

  return (
    <>
      <form action={action} style={{ display: 'contents' }}>
        {button}
        <Variant {...props} />
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

import type {LoaderFunctionArgs, SerializeFrom} from '@vercel/remix'
import {useLoaderData, useRevalidator} from '@remix-run/react'

import type {TableProps, FooterProps} from 'ui/react'
import {
  Timestamp,
  tableQuery,
  Button,
  ViewPublishedButton,
  PreviewDraftsButton,
  footerQuery,
  Table,
  Footer,
} from 'ui/react'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
  type ClientPerspective,
} from '@sanity/client'
import {getSession} from '~/sessions'
import {lazy, useEffect} from 'react'
import {useIsEnabled, useLiveQuery} from '@sanity/preview-kit'
import {sanityFetch, token} from '~/sanity'

const LiveStoreVariant = lazy(() => import('~/variants/live-store'))

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const previewDrafts = session.get('view') === 'drafts'
  const url = new URL(request.url)
  let perspective: Exclude<ClientPerspective, 'raw'> = 'published'
  if (previewDrafts) {
    perspective = url.searchParams.has('sanity-preview-perspective')
      ? ((url.searchParams.get('sanity-preview-perspective')?.includes(',')
          ? url.searchParams.get('sanity-preview-perspective')?.split(',')
          : url.searchParams.get('sanity-preview-perspective')) as Exclude<
          ClientPerspective,
          'raw'
        >)
      : 'drafts'
  }

  const [table, footer] = await Promise.all([
    sanityFetch<TableProps['data']>({previewDrafts, query: tableQuery, perspective}),
    sanityFetch<FooterProps['data']>({previewDrafts, query: footerQuery, perspective}),
  ])
  const timestamp = new Date().toJSON()

  return {
    studioUrl: process.env.STUDIO_URL || 'http://localhost:3333',
    previewDrafts,
    token,
    table,
    footer,
    timestamp,
    perspective,
    server__adapter: adapter,
    server__environment: environment,
  }
}

function Variant(props: SerializeFrom<typeof loader> & {children: React.ReactNode}) {
  if (props.previewDrafts) {
    return <LiveStoreVariant {...props} />
  }
  return <>{props.children}</>
}

function PreviewTable(props: {initialData: unknown}) {
  const [table] = useLiveQuery(props.initialData, tableQuery)
  return <Table data={table} />
}

function PreviewFooter(props: {initialData: number}) {
  const [footer] = useLiveQuery(props.initialData, footerQuery)
  return <Footer data={footer} />
}

export default function Index() {
  const props = useLoaderData<typeof loader>()
  const {previewDrafts, timestamp, server__adapter, server__environment, perspective} = props

  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
      perspective,
    })
  }, [perspective])

  const button = previewDrafts ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const action = previewDrafts ? '/api/disable-draft' : '/api/draft'
  const {table, footer} = props

  return (
    <>
      <form action={action} style={{display: 'contents'}}>
        {button}
      </form>
      <Variant {...props}>
        <PreviewTable initialData={table} />
        <PreviewFooter initialData={footer} />
        <Timestamp date={timestamp} />
        <RefreshButton />
      </Variant>
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({server__adapter, server__environment}),
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

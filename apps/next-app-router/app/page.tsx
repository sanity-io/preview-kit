import { draftMode } from 'next/headers'
import { ViewPublishedButton, PreviewDraftsButton } from 'ui/react'
import RefreshButton from './RefreshButton'
import { unstable__adapter, unstable__environment } from '@sanity/client'
import { Table, Timestamp, tableQuery, footerQuery, Footer } from 'ui/react'
import { sanityClient, draftsClient } from './sanity.client'

export default async function Page() {
  const isDraftMode = draftMode().isEnabled
  const button = isDraftMode ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const client = isDraftMode ? draftsClient : sanityClient
  const table = client.fetch(tableQuery)
  const footer = client.fetch(footerQuery)
  return (
    <>
      <form action="/api/draft" style={{ display: 'contents' }}>
        {button}
        <Table data={await table} />
        <Footer data={await footer} />
        <Timestamp date={new Date()} />
      </form>
      <RefreshButton />
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ unstable__adapter, unstable__environment }),
        }}
      />
    </>
  )
}

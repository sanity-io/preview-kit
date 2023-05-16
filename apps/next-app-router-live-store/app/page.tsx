import { draftMode } from 'next/headers'
import {
  ViewPublishedButton,
  PreviewDraftsButton,
  Footer,
  footerQuery,
} from 'ui/react'
import RefreshButton from './RefreshButton'
import { unstable__adapter, unstable__environment } from '@sanity/client'
import { Table, Timestamp, tableQuery } from 'ui/react'
import { sanityClient, draftsClient } from './sanity.client'
import PreviewProvider from './PreviewProvider'
import PreviewTable from './PreviewTable'
import PreviewFooter from './PreviewFooter'

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
}

export default async function Page() {
  const isDraftMode = draftMode().isEnabled
  const button = isDraftMode ? <ViewPublishedButton /> : <PreviewDraftsButton />
  const client = isDraftMode ? draftsClient.withConfig({ token }) : sanityClient
  const table = client.fetch(tableQuery)
  const footer = client.fetch(footerQuery)
  return (
    <>
      <form action="/api/draft" style={{ display: 'contents' }}>
        {button}
        {isDraftMode ? (
          <PreviewProvider token={client.config().token!}>
            <PreviewTable data={await table} />
            <PreviewFooter data={await footer} />
          </PreviewProvider>
        ) : (
          <>
            <Table data={await table} />
            <Footer data={await footer} />
          </>
        )}
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

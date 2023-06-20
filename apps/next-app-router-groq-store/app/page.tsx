import { unstable__adapter, unstable__environment } from '@sanity/client'
import { draftMode } from 'next/headers'
import { Footer, Table, Timestamp, footerQuery, tableQuery } from 'ui/react'
import DraftModeButton from './DraftModeButton'
import PreviewFooter from './PreviewFooter'
import PreviewProvider from './PreviewProvider'
import PreviewTable from './PreviewTable'
import RefreshButton from './RefreshButton'
import { getClient } from './sanity.client'

export default async function Page() {
  const token = process.env.SANITY_API_READ_TOKEN!
  const preview = draftMode().isEnabled ? { token } : undefined
  const client = getClient(preview)
  const [table, footer] = await Promise.all([
    client.fetch(tableQuery),
    client.fetch(footerQuery),
  ])
  return (
    <>
      {preview ? (
        <PreviewProvider token={preview.token!}>
          <DraftModeButton />
          <PreviewTable data={table} />
          <PreviewFooter data={footer} />
        </PreviewProvider>
      ) : (
        <>
          <DraftModeButton />
          <Table data={table} />
          <Footer data={footer} />
        </>
      )}
      <Timestamp date={new Date()} />
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

import { draftMode } from 'next/headers'
import { Footer, Table, footerQuery, tableQuery } from 'ui/react'
import PreviewFooter from './PreviewFooter'
import PreviewProvider from './PreviewProvider'
import PreviewTable from './PreviewTable'
import { getClient } from './sanity.client'

export default async function LiveStoreVariant() {
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
          <PreviewTable data={table} />
          <PreviewFooter data={footer} />
        </PreviewProvider>
      ) : (
        <>
          <Table data={table} />
          <Footer data={footer} />
        </>
      )}
    </>
  )
}

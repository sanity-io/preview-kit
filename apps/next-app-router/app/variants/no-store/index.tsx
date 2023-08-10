import { draftMode } from 'next/headers'
import { Footer, Table, footerQuery, tableQuery } from 'ui/react'
import PreviewFooter from './PreviewFooter'
import PreviewTable from './PreviewTable'
import { getClient } from './sanity.client'

export default async function Page() {
  const token = process.env.SANITY_API_READ_TOKEN!
  const preview = draftMode().isEnabled ? { token } : undefined
  const client = getClient(preview)
  const [table, footer] = await Promise.all([
    client.fetch(
      tableQuery,
      {},
      { cache: 'force-cache', next: { tags: ['pages'] } },
    ),
    client.fetch(
      footerQuery,
      {},
      { cache: 'force-cache', next: { tags: ['pages'] } },
    ),
  ])
  console.log('no-store')
  return (
    <>
      {preview ? (
        <>
          <PreviewTable data={table} />
          <PreviewFooter data={footer} />
        </>
      ) : (
        <>
          <Table data={table} />
          <Footer data={footer} />
        </>
      )}
    </>
  )
}

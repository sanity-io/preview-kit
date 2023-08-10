import { draftMode } from 'next/headers'
import { Footer, Table, footerQuery, tableQuery } from 'ui/react'
import { getClient } from './sanity.client'

export default async function DefaultVariant() {
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
  console.log('default')
  return (
    <>
      <Table data={table} />
      <Footer data={footer} />
    </>
  )
}

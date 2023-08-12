import { draftMode } from 'next/headers'
import {
  Footer,
  FooterProps,
  Table,
  TableProps,
  footerQuery,
  tableQuery,
} from 'ui/react'
import { getClient } from './sanity.client'
import { QueryParams } from '@sanity/client'

async function sanityFetch<R>(
  query: string,
  params: QueryParams = {},
  tags?: string[],
): Promise<R> {
  const token = process.env.SANITY_API_READ_TOKEN!
  const preview = draftMode().isEnabled ? { token } : undefined
  const client = getClient(preview)
  return client.fetch(query, params, { cache: 'force-cache', next: { tags } })
}

async function DynamicTable() {
  const data = await sanityFetch<TableProps['data']>(tableQuery, {}, ['pages'])

  return <Table data={data} />
}
async function DynamicFooter() {
  const data = await sanityFetch<FooterProps['data']>(footerQuery, {}, [
    'pages',
  ])

  return <Footer data={data} />
}

export default function DefaultVariant({ children }: React.PropsWithChildren) {
  return (
    <>
      <DynamicTable />
      <DynamicFooter />
      {children}
    </>
  )
}

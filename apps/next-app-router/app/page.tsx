import {
  Footer,
  FooterProps,
  Table,
  TableProps,
  footerQuery,
  tableQuery,
  Timestamp,
} from 'ui/react'
import { draftMode } from 'next/headers'
import { LiveQuery } from './next-sanity/live-query'
import { sanityFetch } from './sanity.fetch'
import RefreshButton from './RefreshButton'
import Variant from './Variant'
import { PreviewTable, PreviewFooter } from './previews'

export default function Page() {
  return (
    <Variant>
      <ServerTable />
      <ServerFooter />
      <Timestamp date={new Date()} />
      <RefreshButton />
    </Variant>
  )
}

async function ServerTable() {
  const data = await sanityFetch<TableProps['data']>({
    query: tableQuery,
    tags: ['pages'],
  })

  return (
    <LiveQuery
      enabled={draftMode().isEnabled}
      initialData={data}
      query={tableQuery}
      as={PreviewTable}
    >
      <Table data={data} />
    </LiveQuery>
  )
}
async function ServerFooter() {
  const data = await sanityFetch<FooterProps['data']>({
    query: footerQuery,
    tags: ['pages'],
  })

  return (
    <LiveQuery
      enabled={draftMode().isEnabled}
      initialData={data}
      query={footerQuery}
      as={PreviewFooter}
    >
      <Footer data={data} />
    </LiveQuery>
  )
}

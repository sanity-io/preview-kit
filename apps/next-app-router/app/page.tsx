import {
  Footer,
  FooterProps,
  Table,
  TableProps,
  footerQuery,
  tableQuery,
  Timestamp,
  TableFallback,
} from 'ui/react'
import {draftMode} from 'next/headers'
import {LiveQuery} from '@sanity/preview-kit/live-query'
import {sanityFetch} from './sanity.fetch'
import RefreshButton from './RefreshButton'
import {PreviewTable, PreviewFooter} from './previews'
import {Suspense} from 'react'
import LiveStoreVariant from './variants/live-store'

export const runtime = 'edge'

export default async function Page() {
  const footer = await sanityFetch<FooterProps['data']>({
    query: footerQuery,
    tags: ['pages'],
  })

  return (
    <LiveStoreVariant>
      <Suspense fallback={<TableFallback rows={Math.min(10, footer)} />}>
        <ServerTable />
      </Suspense>
      <LiveQuery
        enabled={draftMode().isEnabled}
        initialData={footer}
        query={footerQuery}
        as={PreviewFooter}
        throwOnMissingProvider={false}
      >
        <Footer data={footer} />
      </LiveQuery>
      <Timestamp date={new Date()} />
      <RefreshButton />
    </LiveStoreVariant>
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
      throwOnMissingProvider={false}
    >
      <Table data={data} />
    </LiveQuery>
  )
}

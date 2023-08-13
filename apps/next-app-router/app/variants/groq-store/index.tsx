import { draftMode } from 'next/headers'
import {
  Footer,
  FooterProps,
  Table,
  TableProps,
  footerQuery,
  tableQuery,
} from 'ui/react'

import dynamic from 'next/dynamic'
import { sanityFetch, token } from './sanity.fetch'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))
const PreviewTable = dynamic(() => import('../../PreviewTable'))
const PreviewFooter = dynamic(() => import('../../PreviewFooter'))

export default async function GroqStoreVariant({
  children,
}: React.PropsWithChildren) {
  const [table, footer] = await Promise.all([
    sanityFetch<TableProps['data']>({ query: tableQuery, tags: ['pages'] }),
    sanityFetch<FooterProps['data']>({ query: footerQuery, tags: ['pages'] }),
  ])

  return (
    <>
      {draftMode().isEnabled ? (
        <PreviewProvider token={token}>
          <PreviewTable data={table} />
          <PreviewFooter data={footer} />
          {children}
        </PreviewProvider>
      ) : (
        <>
          <Table data={table} />
          <Footer data={footer} />
          {children}
        </>
      )}
    </>
  )
}

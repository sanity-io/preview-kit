import {
  Footer,
  FooterProps,
  Table,
  TableProps,
  footerQuery,
  tableQuery,
} from 'ui/react'
import { sanityFetch } from './sanity.fetch'

async function DynamicTable() {
  const data = await sanityFetch<TableProps['data']>({
    query: tableQuery,
    tags: ['pages'],
  })

  return <Table data={data} />
}
async function DynamicFooter() {
  const data = await sanityFetch<FooterProps['data']>({
    query: footerQuery,
    tags: ['pages'],
  })

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

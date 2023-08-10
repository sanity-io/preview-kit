import type { SerializeFrom } from '@vercel/remix'
import { Footer, Table } from 'ui/react'
import type { loader } from '~/routes'

export default function DefaultVariant({
  table,
  footer,
}:  SerializeFrom<typeof loader>) {
  console.log('default')
  return (
    <>
      <Table data={table} />
      <Footer data={footer} />
    </>
  )
}

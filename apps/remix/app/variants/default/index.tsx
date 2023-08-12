import type { SerializeFrom } from '@vercel/remix'
import { Footer, Table } from 'ui/react'
import type { loader } from '~/routes'

export default function DefaultVariant({
  children,
  table,
  footer,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return (
    <>
      <Table data={table} />
      <Footer data={footer} />
      {children}
    </>
  )
}

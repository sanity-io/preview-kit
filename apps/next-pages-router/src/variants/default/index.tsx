import type { InferGetStaticPropsType } from 'next'
import { Footer, Table } from 'ui/react'
import { getStaticProps } from '../../pages'

export default function DefaultVariant({
  children,
  table,
  footer,
}: InferGetStaticPropsType<typeof getStaticProps> & React.PropsWithChildren) {
  return (
    <>
      <Table data={table} />
      <Footer data={footer} />
      {children}
    </>
  )
}

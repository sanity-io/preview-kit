import type { InferGetStaticPropsType } from 'next'
import { Footer, Table } from 'ui/react'
import { getStaticProps } from '../../pages'

export default function DefaultVariant({
  table,
  footer,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Table data={table} />
      <Footer data={footer} />
    </>
  )
}

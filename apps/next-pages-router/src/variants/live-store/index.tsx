import type { InferGetStaticPropsType } from 'next'
import dynamic from 'next/dynamic'
import { Table, Footer } from 'ui/react'

import { getStaticProps } from '../../pages'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))
const PreviewTable = dynamic(() => import('../../PreviewTable'))
const PreviewFooter = dynamic(() => import('../../PreviewFooter'))

export default function Page({
  draftMode,
  token,
  table,
  footer,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      {draftMode ? (
        <PreviewProvider token={token!}>
          <PreviewTable data={table} />
          <PreviewFooter data={footer} />
        </PreviewProvider>
      ) : (
        <>
          <Table data={table} />
          <Footer data={footer} />
        </>
      )}
    </>
  )
}

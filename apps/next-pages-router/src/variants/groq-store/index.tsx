import type { InferGetStaticPropsType } from 'next'
import dynamic from 'next/dynamic'
import { Table, Footer } from 'ui/react'

import { getStaticProps } from '../../pages'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))
const PreviewTable = dynamic(() => import('../../PreviewTable'))
const PreviewFooter = dynamic(() => import('../../PreviewFooter'))

export default function Page({
  children,
  draftMode,
  token,
  table,
  footer,
}: InferGetStaticPropsType<typeof getStaticProps> & React.PropsWithChildren) {
  return (
    <>
      {draftMode ? (
        <PreviewProvider token={token!}>
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

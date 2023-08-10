import type { InferGetStaticPropsType } from 'next'

import { lazy } from 'react'
import Footer from './Footer'
import Table from './Table'
import { getStaticProps } from '../../pages'

const PreviewProvider = lazy(() => import('./PreviewProvider'))

export default function Page({
  draftMode,
  token,
  table,
  footer,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  console.log('live-store')
  return (
    <>
      {draftMode ? (
        <PreviewProvider token={token!}>
          <Table data={table} />
          <Footer data={footer} />
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

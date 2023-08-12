import type { SerializeFrom } from '@vercel/remix'
import { Footer, Table } from 'ui/react'
import { lazy } from 'react'

import type { loader } from '~/routes'

const PreviewProvider = lazy(() => import('./PreviewProvider'))
const PreviewTable = lazy(() => import('../../PreviewTable'))
const PreviewFooter = lazy(() => import('../../PreviewFooter'))

export default function GroqStoreVariant({
  preview,
  children,
  table,
  footer,
  token,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return preview ? (
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
  )
}

import type { SerializeFrom } from '@vercel/remix'

import Footer from './Footer'
import PreviewProvider from './PreviewProvider'
import Table from './Table'
import type { loader } from '~/routes'

export default function GroqStoreVariant({
  preview,
  table,
  footer,
  token,
}: SerializeFrom<typeof loader>) {
  console.log('groq-store')
  return preview ? (
    <PreviewProvider token={token!}>
      <Table data={table} />
      <Footer data={footer} />
    </PreviewProvider>
  ) : (
    <>
      <Table data={table} />
      <Footer data={footer} />
    </>
  )
}

import { type FooterProps, Footer, query as footerQuery } from 'app/Footer'
import PreviewButton from 'app/PreviewButton'
import PreviewFooter from 'app/PreviewFooter'
import { PreviewSuspense } from 'app/PreviewSuspense'
import PreviewTable from 'app/PreviewTable'
import { createClient } from 'app/sanity.client'
import {
  type TableProps,
  query as tableQuery,
  Table,
  TableFallback,
} from 'app/Table'
import { previewData } from 'next/headers'

export default async function Next13TokenEdgePage() {
  const token = previewData()?.token

  const button = (
    <PreviewButton
      preview={!!token}
      start="/api/preview?slug=next13-token-edge"
      stop="/api/exit-preview?slug=next13-token-edge"
    />
  )

  if (token) {
    const client = createClient().withConfig({ token })
    const footerData = await client.fetch<FooterProps['data']>(footerQuery)

    return (
      <>
        {button}
        <PreviewSuspense
          fallback={
            <>
              <TableFallback rows={footerData} />
              <Footer data={footerData} />
            </>
          }
        >
          <PreviewTable token={token} />
          <PreviewFooter token={token} />
        </PreviewSuspense>
      </>
    )
  }

  const client = createClient()
  const tablePromise = client.fetch<TableProps['data']>(tableQuery)
  const footerPromise = client.fetch<FooterProps['data']>(footerQuery)
  return (
    <>
      {button}
      <Table data={await tablePromise} />
      <Footer data={await footerPromise} />
    </>
  )
}

export const runtime = 'experimental-edge'

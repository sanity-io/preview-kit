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

export default async function Next13CookieEdgePage() {
  const preview = !!previewData()

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview-next13-cookie-edge"
      stop="/api/exit-preview-next13-cookie-edge"
    />
  )

  if (preview) {
    const client = createClient().withConfig({
      // eslint-disable-next-line no-process-env
      token: process.env.SANITY_API_READ_TOKEN,
    })
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
          <PreviewTable token={null} />
          <PreviewFooter token={null} />
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

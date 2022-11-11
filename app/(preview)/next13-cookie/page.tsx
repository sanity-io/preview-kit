import { type FooterProps, Footer, query as footerQuery } from 'app/Footer'
import PreviewButton from 'app/PreviewButton'
import PreviewFooter from 'app/PreviewFooter'
import { PreviewSuspense } from 'app/PreviewSuspense'
import PreviewTable from 'app/PreviewTable'
import {
  type TableProps,
  query as tableQuery,
  Table,
  TableFallback,
} from 'app/Table'
import { createClient } from 'app/utils'
import { previewData } from 'next/headers'

export default async function Next13CookiePage() {
  const preview = !!previewData()

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview-next13-cookie"
      stop="/api/exit-preview-next13-cookie"
    />
  )

  if (preview) {
    // eslint-disable-next-line no-process-env
    const client = createClient(process.env.SANITY_API_READ_TOKEN)
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

export const revalidate = 60

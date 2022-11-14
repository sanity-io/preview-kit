import { type FooterProps, query as footerQuery } from 'app/Footer'
import PreviewButton from 'app/PreviewButton'
import PreviewTemplate from 'app/PreviewTemplate'
import ProductionTemplate from 'app/ProductionTemplate'
import { createClient } from 'app/sanity.client'
import { type TableProps, query as tableQuery } from 'app/Table'
import { previewData } from 'next/headers'

export default async function Next13CookieEdgePage() {
  const preview = !!previewData()

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview?slug=next13-cookie-edge"
      stop="/api/exit-preview?slug=next13-cookie-edge"
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
        <PreviewTemplate token={null} footerData={footerData} />
      </>
    )
  }

  const client = createClient()
  const tablePromise = client.fetch<TableProps['data']>(tableQuery)
  const footerPromise = client.fetch<FooterProps['data']>(footerQuery)
  return (
    <>
      {button}
      <ProductionTemplate
        tableData={await tablePromise}
        footerData={await footerPromise}
      />
    </>
  )
}

export const runtime = 'experimental-edge'

import { type FooterProps, query as footerQuery } from 'app/Footer'
import PreviewButton from 'app/PreviewButton'
import PreviewTemplate from 'app/PreviewTemplate'
import ProductionTemplate from 'app/ProductionTemplate'
import { createClient } from 'app/sanity.client'
import { type TableProps, query as tableQuery } from 'app/Table'
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
        <PreviewTemplate token={token} footerData={footerData} />
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

import PreviewButton from 'app/PreviewButton'
import PreviewTemplate from 'app/PreviewTemplate'
import { createClient } from 'app/sanity.client'
import Container from 'components/Container'
import { type FooterProps, query as footerQuery } from 'components/Footer'
import PageTemplate from 'components/PageTemplate'
import { type TableProps, query as tableQuery } from 'components/Table'
import { previewData } from 'next/headers'

export default async function Next13CookiePage() {
  const preview = !!previewData()

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview?slug=next13-cookie"
      stop="/api/exit-preview?slug=next13-cookie"
    />
  )

  if (preview) {
    const client = createClient().withConfig({
      // eslint-disable-next-line no-process-env
      token: process.env.SANITY_API_READ_TOKEN,
    })
    const footerData = await client.fetch<FooterProps['data']>(footerQuery)

    return (
      <Container>
        {button}
        <PreviewTemplate token={null} footerData={footerData} />
      </Container>
    )
  }

  const client = createClient()
  const tablePromise = client.fetch<TableProps['data']>(tableQuery)
  const footerPromise = client.fetch<FooterProps['data']>(footerQuery)
  return (
    <Container>
      {button}
      <PageTemplate
        tableData={await tablePromise}
        footerData={await footerPromise}
      />
    </Container>
  )
}

export const revalidate = 60

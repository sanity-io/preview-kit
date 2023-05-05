import { PreviewButton } from 'ui'
import PreviewTemplate from 'app/PreviewTemplate'
import { createClient } from 'app/sanity.client'
import { type FooterProps, query as footerQuery } from 'components/Footer'
import PageTemplate from 'components/PageTemplate'
import { query as tableQuery, type TableProps } from 'components/Table'
import { draftMode } from 'next/headers'
import { cache } from 'react'

const client = createClient()
const cachedFetch = cache(client.fetch.bind(client))

export default async function Next13CookiePage() {
  const preview = draftMode().isEnabled

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview?slug=cookie"
      stop="/api/exit-preview?slug=cookie"
    />
  )

  if (draftMode().isEnabled) {
    // eslint-disable-next-line no-shadow
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

  const tablePromise = cachedFetch(tableQuery)
  const footerPromise = cachedFetch(footerQuery)
  return (
    <>
      {button}
      <PageTemplate
        tableData={await tablePromise}
        footerData={await footerPromise}
      />
    </>
  )
}

export const revalidate = 60

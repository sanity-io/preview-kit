import { PreviewButton } from 'ui'
import PreviewTemplate from 'app/PreviewTemplate'
import { createClient } from 'app/sanity.client'
import { type FooterProps, query as footerQuery } from 'components/Footer'
import PageTemplate from 'components/PageTemplate'
import { query as tableQuery, type TableProps } from 'components/Table'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import {} from 'app/sanity.live'

const client = createClient()
const cachedFetch = cache(client.fetch.bind(client))

export default async function Next13TokenPage() {
  const preview = draftMode().isEnabled

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview?slug=token"
      stop="/api/exit-preview?slug=token"
    />
  )

  if (preview) {
    // eslint-disable-next-line no-process-env
    const token = process.env.SANITY_API_READ_TOKEN
    if (!token) {
      throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
    }
    // eslint-disable-next-line no-shadow
    const client = createClient().withConfig({ token })
    const footerData = await client.fetch<FooterProps['data']>(footerQuery)

    return (
      <>
        {button}
        <PreviewTable token={token} />
        <PreviewFooter token={token} />
      </>
    )
  }

  const tablePromise = cachedFetch<TableProps['data']>(tableQuery)
  const footerPromise = cachedFetch<FooterProps['data']>(footerQuery)
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

import PreviewButton from 'apps/next/app/PreviewButton'
import PreviewTemplate from 'apps/next/app/PreviewTemplate'
import { createClient } from 'apps/next/app/sanity.client'
import {
  type FooterProps,
  query as footerQuery,
} from 'apps/next/components/Footer'
import PageTemplate from 'apps/next/components/PageTemplate'
import {
  query as tableQuery,
  type TableProps,
} from 'apps/next/components/Table'
import { previewData } from 'next/headers'
import { cache } from 'react'

const client = createClient()
const cachedFetch = cache(client.fetch.bind(client))

export default async function Next13TokenPage() {
  const token = (previewData() as { token?: string })?.token

  const button = (
    <PreviewButton
      preview={!!token}
      start="/api/preview?slug=next13-token"
      stop="/api/exit-preview?slug=next13-token"
    />
  )

  if (token) {
    // eslint-disable-next-line no-shadow
    const client = createClient().withConfig({ token })
    const footerData = await client.fetch<FooterProps['data']>(footerQuery)

    return (
      <>
        {button}
        <PreviewTemplate token={token} footerData={footerData} />
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

export const revalidate = 60

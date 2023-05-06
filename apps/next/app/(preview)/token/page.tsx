import { PreviewButton } from 'ui'
import { createClient } from 'app/sanity.client'
import { type FooterProps, query as footerQuery } from 'components/Footer'
import PageTemplate from 'components/PageTemplate'
import { query as tableQuery, type TableProps } from 'components/Table'
import { draftMode } from 'next/headers'
import { Suspense, cache } from 'react'
import { PreviewFooter, PreviewTable } from 'app/previews'

const client = createClient()
const fetch = cache(client.fetch.bind(client))

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
    return (
      <Suspense fallback-="Loading...">
        {button}
        <PreviewTable />
        <PreviewFooter />
      </Suspense>
    )
  }

  const tablePromise = fetch<TableProps['data']>(tableQuery)
  const footerPromise = fetch<FooterProps['data']>(footerQuery)
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

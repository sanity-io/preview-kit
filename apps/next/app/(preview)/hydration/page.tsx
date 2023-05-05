import { Count, type CountProps, queryCount } from 'ui'
import { PreviewButton } from 'ui'
import PreviewCount from 'app/PreviewCount'
import { createClient } from 'app/sanity.client'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import { PreviewSuspense } from './PreviewSuspense'

const client = createClient()
const cachedFetch = cache(client.fetch.bind(client))

const previewClient = client.withConfig({
  // eslint-disable-next-line no-process-env
  token: process.env.SANITY_API_READ_TOKEN,
})
const cachedPreviewFetch = cache(previewClient.fetch.bind(previewClient))

export default async function Next13HydrationPage() {
  const preview = draftMode().isEnabled

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview?slug=hydration"
      stop="/api/exit-preview?slug=hydration"
    />
  )

  if (preview) {
    const data = await cachedPreviewFetch(queryCount)

    return (
      <>
        {button}
        <PreviewSuspense fallback={<Count data={data} />}>
          <PreviewCount initialData={data} />
        </PreviewSuspense>
      </>
    )
  }

  const data = await cachedFetch(queryCount)
  return (
    <>
      {button}
      <Count data={data} />
    </>
  )
}

export const revalidate = 60

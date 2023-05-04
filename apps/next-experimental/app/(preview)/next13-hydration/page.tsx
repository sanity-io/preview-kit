import { Count, type CountProps, query } from 'app/Count'
import PreviewButton from 'app/PreviewButton'
import PreviewCount from 'app/PreviewCount'
import { createClient } from 'app/sanity.client'
import { previewData } from 'next/headers'
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
  const preview = !!previewData()

  const button = (
    <PreviewButton
      preview={preview}
      start="/api/preview?slug=next13-hydration"
      stop="/api/exit-preview?slug=next13-hydration"
    />
  )

  if (preview) {
    const data = await cachedPreviewFetch<CountProps['data']>(query)

    return (
      <>
        {button}
        <PreviewSuspense fallback={<Count data={data} />}>
          <PreviewCount initialData={data} />
        </PreviewSuspense>
      </>
    )
  }

  const data = await cachedFetch<CountProps['data']>(query)
  return (
    <>
      {button}
      <Count data={data} />
    </>
  )
}

export const revalidate = 60

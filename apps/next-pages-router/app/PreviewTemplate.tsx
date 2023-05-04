'use client'

import { PreviewSuspense } from '@sanity/preview-kit'
import PreviewFooter from 'app/PreviewFooter'
import PreviewTable from 'app/PreviewTable'
import FallbackTemplate from 'components/FallbackTemplate'
import type { FooterProps } from 'components/Footer'

export default function PreviewTemplate({
  token,
  footerData,
}: {
  token: string | null
  footerData: FooterProps['data']
}) {
  return (
    <PreviewSuspense fallback={<FallbackTemplate footerData={footerData} />}>
      <PreviewTable token={token} />
      <PreviewFooter token={token} />
    </PreviewSuspense>
  )
}

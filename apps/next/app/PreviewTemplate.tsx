'use client'

import { PreviewSuspense } from '@sanity/preview-kit'
import PreviewFooter from 'apps/next/app/PreviewFooter'
import PreviewTable from 'apps/next/app/PreviewTable'
import FallbackTemplate from 'apps/next/components/FallbackTemplate'
import type { FooterProps } from 'apps/next/components/Footer'

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

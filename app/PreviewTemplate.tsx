'use client'

import { PreviewSuspense } from '@sanity/preview-kit'
import FallbackTemplate from 'components/FallbackTemplate'
import type { FooterProps } from 'components/Footer'
import { lazy } from 'react'

const PreviewTable = lazy(() => import('app/PreviewTable'))
const PreviewFooter = lazy(() => import('app/PreviewFooter'))

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

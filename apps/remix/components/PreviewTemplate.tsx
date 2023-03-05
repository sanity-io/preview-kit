import { PreviewSuspense } from '@sanity/preview-kit'
import FallbackTemplate from 'apps/next/components/FallbackTemplate'
import type { FooterProps } from './Footer'
import { lazy } from 'react'

const PreviewTable = lazy(() => import('./PreviewTable'))
const PreviewFooter = lazy(() => import('./PreviewFooter'))

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

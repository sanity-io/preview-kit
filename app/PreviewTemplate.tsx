'use client'

import { PreviewSuspense } from '@sanity/preview-kit'
import { type FooterProps, Footer } from 'app/Footer'
import { lazy } from 'react'

import { TableFallback } from './Table'

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
    <PreviewSuspense
      fallback={
        <>
          <TableFallback rows={footerData} />
          <Footer data={footerData} />
        </>
      }
    >
      <PreviewTable token={token} />
      <PreviewFooter token={token} />
    </PreviewSuspense>
  )
}

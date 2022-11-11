'use client'

import { type UsePreview } from '@sanity/preview-kit'
import { type FooterProps, Footer, workaroundQuery } from 'app/Footer'
import { usePreview as _usePreview } from 'app/sanity.preview'

const usePreview: UsePreview<FooterProps['data']> = _usePreview

export default function PreviewFooter({ token }: { token: string | null }) {
  const _data = usePreview(token, workaroundQuery)
  const data = Array.isArray(_data) ? new Set(_data).size : 0
  return <Footer data={data} />
}

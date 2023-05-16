'use client'

import { FooterProps, footerQuery, Footer } from 'ui/react'
import { useListeningQuery } from '@sanity/preview-kit'

export default function PreviewFooter(props: FooterProps) {
  const data = useListeningQuery<FooterProps['data']>(props.data, footerQuery)

  return <Footer data={data} />
}

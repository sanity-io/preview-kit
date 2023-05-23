import type { FooterProps } from 'ui/react'
import { footerQuery, Footer as UiFooter } from 'ui/react'
import { useListeningQuery } from '@sanity/preview-kit'

export default function Footer(props: FooterProps) {
  const data = useListeningQuery<FooterProps['data']>(props.data, footerQuery)

  return <UiFooter data={data} />
}

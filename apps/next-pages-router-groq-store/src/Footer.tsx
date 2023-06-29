import { FooterProps, footerQuery, Footer as UiFooter } from 'ui/react'
import { useLiveQuery } from '@sanity/preview-kit'

export default function Footer(props: FooterProps) {
  const [data] = useLiveQuery<FooterProps['data']>(props.data, footerQuery)

  return <UiFooter data={data} />
}

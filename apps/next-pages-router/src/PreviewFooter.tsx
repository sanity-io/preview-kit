import { FooterProps, footerQuery, Footer } from 'ui/react'
import { useLiveQuery } from '@sanity/preview-kit'

export default function PreviewFooter(props: FooterProps) {
  const [data] = useLiveQuery<FooterProps['data']>(props.data, footerQuery)

  return <Footer data={data} />
}

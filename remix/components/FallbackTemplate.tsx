import { type FooterProps, Footer } from './Footer'
import { TableFallback } from './Table'

export default function FallbackTemplate({
  footerData,
}: {
  footerData: FooterProps['data']
}) {
  return (
    <>
      <TableFallback rows={footerData} />
      <Footer data={footerData} />
    </>
  )
}

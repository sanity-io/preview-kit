import { Footer, type FooterProps } from './Footer'
import { Table, type TableProps } from './Table'

export default function PageTemplate({
  tableData,
  footerData,
}: {
  tableData: TableProps['data']
  footerData: FooterProps['data']
}) {
  return (
    <>
      <Table data={tableData} />
      <Footer data={footerData} />
    </>
  )
}

import { type FooterProps, Footer } from './Footer'
import { type TableProps, Table } from './Table'

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

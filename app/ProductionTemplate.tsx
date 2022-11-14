import { type FooterProps, Footer } from 'app/Footer'
import { type TableProps, Table } from 'app/Table'

export default function ProductionTemplate({
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

import { type TableProps, query as tableQuery, Table } from 'app/Table'

export default function PreviewTableProps({ token }: { token?: string }) {
  const data: any[] = []
  return <Table data={data} />
}

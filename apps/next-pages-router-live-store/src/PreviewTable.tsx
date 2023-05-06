import { TableProps, tableQuery, Table } from 'ui/react'
import { useListeningQuery } from '@sanity/preview-kit'

export default function PreviewTable(props: TableProps) {
  const data = useListeningQuery<TableProps['data']>(props.data, tableQuery)

  return <Table data={data} />
}

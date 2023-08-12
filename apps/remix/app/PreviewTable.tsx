import type { TableProps } from 'ui/react'
import { tableQuery, Table } from 'ui/react'
import { useLiveQuery } from '@sanity/preview-kit'

export default function PreviewTable(props: TableProps) {
  const [data] = useLiveQuery<TableProps['data']>(props.data, tableQuery)

  return <Table data={data} />
}

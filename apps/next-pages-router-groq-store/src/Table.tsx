import { TableProps, tableQuery, Table as UiTable } from 'ui/react'
import { useListeningQuery } from '@sanity/preview-kit'

export default function Table(props: TableProps) {
  const data = useListeningQuery<TableProps['data']>(props.data, tableQuery)

  return <UiTable data={data} />
}
